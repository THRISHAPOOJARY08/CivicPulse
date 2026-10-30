const { getSupabaseAdmin } = require('../config/supabase');

const MAX_CANDIDATES_EXAMINED = 100;
const RECENT_DAYS_WINDOW = 30;
const DUPLICATE_DISTANCE_THRESHOLD_METERS = 300;
const DUPLICATE_SCORE_THRESHOLD = 60; // Candidates scoring >= 60 are recorded

/**
 * Calculates geographic distance between two points in meters using the Haversine formula.
 */
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in meters
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Tokenizes text into a normalized lowercase word Set, stripping punctuation and stop words.
 */
const tokenizeText = (text) => {
  if (!text || typeof text !== 'string') return new Set();
  const stopWords = new Set(['the', 'and', 'for', 'are', 'was', 'with', 'this', 'that', 'near', 'from', 'have', 'has']);
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 3 && !stopWords.has(word));
  return new Set(words);
};

/**
 * Computes Jaccard similarity coefficient between two sets (0.0 to 1.0).
 */
const computeJaccard = (setA, setB) => {
  if (!setA || !setB || setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
};

/**
 * Examines up to 100 recent complaints within a 30-day window and detects duplicate candidates.
 * Persists candidates to PostgreSQL `duplicate_candidates` table using Supabase.
 * 
 * Factor scoring (Total 100):
 * - Geographic proximity: up to 30 pts (0-50m: 30, 51-150m: 20, 151-300m: 10)
 * - Same category: 30 pts
 * - Keyword overlap: up to 20 pts
 * - Description similarity: up to 20 pts
 * 
 * Never merges or deletes complaints automatically.
 * Errors are non-blocking so complaint creation never fails.
 */
const detectAndSaveDuplicates = async (newComplaintId, newComplaint) => {
  try {
    const supabase = getSupabaseAdmin();
    const cutoffTimestamp = new Date(Date.now() - (RECENT_DAYS_WINDOW * 24 * 60 * 60 * 1000)).toISOString();

    // Retrieve up to 100 recent complaints from PostgreSQL
    const { data: candidates, error: queryError } = await supabase
      .from('complaints')
      .select('id, title, description, category, latitude, longitude, ai_keywords, status, created_at')
      .neq('id', newComplaintId)
      .gte('created_at', cutoffTimestamp)
      .order('created_at', { ascending: false })
      .limit(MAX_CANDIDATES_EXAMINED);

    if (queryError) {
      console.warn('[DuplicateService] Error querying candidate complaints from Supabase:', queryError.message);
      return [];
    }

    if (!candidates || candidates.length === 0) {
      return [];
    }

    const newTokens = tokenizeText(`${newComplaint.title} ${newComplaint.description}`);
    const newKeywords = new Set((newComplaint.keywords || newComplaint.ai_keywords || []).map(k => String(k).toLowerCase()));
    const savedCandidates = [];

    for (const candidate of candidates) {
      const candLat = Number(candidate.latitude);
      const candLon = Number(candidate.longitude);

      if (isNaN(candLat) || isNaN(candLon)) {
        continue;
      }

      // 1. Geographic distance check via Haversine
      const distanceMeters = calculateHaversineDistance(
        Number(newComplaint.latitude),
        Number(newComplaint.longitude),
        candLat,
        candLon
      );

      // Strict cutoff: Candidates farther than 300 meters are excluded
      if (distanceMeters > DUPLICATE_DISTANCE_THRESHOLD_METERS) {
        continue;
      }

      const matchReasons = [];
      let candidateScore = 0;

      // 2. Proximity Scoring (Graduated within 300m)
      let proximityScore = 10;
      if (distanceMeters <= 50) {
        proximityScore = 30;
        matchReasons.push(`Immediate geographic proximity: ${Math.round(distanceMeters)}m away (+30 pts)`);
      } else if (distanceMeters <= 150) {
        proximityScore = 20;
        matchReasons.push(`Close geographic proximity: ${Math.round(distanceMeters)}m away (+20 pts)`);
      } else {
        matchReasons.push(`Within duplicate threshold radius: ${Math.round(distanceMeters)}m away (+10 pts)`);
      }
      candidateScore += proximityScore;

      // 3. Category Scoring (30 pts)
      if (newComplaint.category && candidate.category && newComplaint.category === candidate.category) {
        candidateScore += 30;
        matchReasons.push(`Identical civic category: ${newComplaint.category} (+30 pts)`);
      }

      // 4. Keyword Overlap Scoring (up to 20 pts)
      const rawKeywords = Array.isArray(candidate.ai_keywords) ? candidate.ai_keywords : [];
      const candidateKeywords = new Set(rawKeywords.map(k => String(k).toLowerCase()));
      const keywordJaccard = computeJaccard(newKeywords, candidateKeywords);
      const keywordScore = Math.round(keywordJaccard * 20);
      if (keywordScore > 0) {
        candidateScore += keywordScore;
        matchReasons.push(`Related keywords overlap (${keywordScore} pts)`);
      }

      // 5. Description Text Similarity Scoring (up to 20 pts)
      const candidateTokens = tokenizeText(`${candidate.title} ${candidate.description}`);
      const textJaccard = computeJaccard(newTokens, candidateTokens);
      const textScore = Math.round(textJaccard * 20);
      if (textScore > 0) {
        candidateScore += textScore;
        matchReasons.push(`Text and problem description similarity (${textScore} pts)`);
      }

      const totalScore = Math.min(100, candidateScore);

      // If similarity meets or exceeds threshold, persist candidate in Supabase PostgreSQL
      if (totalScore >= DUPLICATE_SCORE_THRESHOLD) {
        const candidateRecord = {
          complaint_id: newComplaintId,
          candidate_complaint_id: candidate.id,
          similarity_score: totalScore,
          distance_meters: Math.round(distanceMeters * 10) / 10,
          reasons: matchReasons,
          reviewed: false
        };

        const { data: insertedRecord, error: insertError } = await supabase
          .from('duplicate_candidates')
          .insert(candidateRecord)
          .select()
          .single();

        if (insertError) {
          console.warn('[DuplicateService] Failed to insert duplicate candidate:', insertError.message);
        } else if (insertedRecord) {
          savedCandidates.push({
            id: insertedRecord.id,
            complaintId: insertedRecord.complaint_id,
            candidateComplaintId: insertedRecord.candidate_complaint_id,
            similarityScore: insertedRecord.similarity_score,
            distanceMeters: Number(insertedRecord.distance_meters),
            reasons: insertedRecord.reasons,
            reviewed: insertedRecord.reviewed,
            candidateTitle: candidate.title,
            candidateStatus: candidate.status,
            createdAt: insertedRecord.created_at
          });
        }
      }
    }

    return savedCandidates;
  } catch (error) {
    console.warn('[DuplicateService] Duplicate candidate detection encountered an error:', error.message);
    return [];
  }
};

/**
 * Retrieves recorded duplicate candidates for a specific complaint ID from Supabase PostgreSQL.
 */
const getDuplicatesForComplaint = async (complaintId) => {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('duplicate_candidates')
      .select('*')
      .or(`complaint_id.eq.${complaintId},candidate_complaint_id.eq.${complaintId}`)
      .order('similarity_score', { ascending: false });

    if (error) {
      console.warn('[DuplicateService] Failed to retrieve duplicates from Supabase:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      complaintId: row.complaint_id,
      candidateComplaintId: row.candidate_complaint_id,
      similarityScore: row.similarity_score,
      distanceMeters: Number(row.distance_meters),
      reasons: Array.isArray(row.reasons) ? row.reasons : [],
      reviewed: row.reviewed,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.warn('[DuplicateService] Failed to retrieve duplicates:', error.message);
    return [];
  }
};

module.exports = {
  calculateHaversineDistance,
  detectAndSaveDuplicates,
  getDuplicatesForComplaint
};
