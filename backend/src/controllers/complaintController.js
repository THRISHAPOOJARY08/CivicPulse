const { getSupabaseAdmin } = require('../config/supabase');
const {
  DEFAULT_CATEGORY,
  CATEGORY_DEPARTMENT_MAP,
  LIMITS
} = require('../config/constants');
const { analyzeComplaint } = require('../services/geminiService');
const { calculatePriority } = require('../services/priorityService');
const { detectAndSaveDuplicates, getDuplicatesForComplaint } = require('../services/duplicateService');

/**
 * Maps PostgreSQL snake_case complaint row to the standardized API response structure.
 * Preserves camelCase and aliases so existing frontend callers and tests continue working seamlessly.
 */
const formatComplaintRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    citizenId: row.user_id, // Alias for backward compatibility
    title: row.title,
    description: row.description,
    summary: row.ai_summary || '',
    aiSummary: row.ai_summary || '',
    category: row.category,
    aiSuggestedCategory: row.category,
    keywords: Array.isArray(row.ai_keywords) ? row.ai_keywords : [],
    aiKeywords: Array.isArray(row.ai_keywords) ? row.ai_keywords : [],
    department: row.suggested_department || 'General Municipal Administration',
    suggestedDepartment: row.suggested_department || 'General Municipal Administration',
    aiSuggestedDepartment: row.suggested_department || 'General Municipal Administration',
    priority: row.priority,
    priorityScore: row.priority_score,
    priorityReasons: Array.isArray(row.priority_reasons) ? row.priority_reasons : [],
    status: row.status,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    locationLabel: row.location_description || '',
    locationDescription: row.location_description || '',
    aiStatus: row.ai_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    statusHistory: Array.isArray(row.status_history) ? row.status_history : []
  };
};

/**
 * POST /api/complaints
 * Submit a new complaint (Citizen / Admin) using Supabase PostgreSQL.
 * Runs single Gemini AI analysis with deterministic fallback and non-blocking duplicate detection.
 */
const createComplaint = async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const { title, description, latitude, longitude, category, locationLabel } = req.validatedComplaint;

    // Guaranteed from verified server-side JWT
    const userId = req.user.id || req.user.uid;
    const testFailureHeader = req.headers['x-civicpulse-test-ai-failure'];

    // 1. Run Gemini AI analysis (single call, 12s timeout, bounded input, zero-trust schema)
    const aiAnalysis = await analyzeComplaint({
      title,
      description,
      userCategory: category,
      testFailureHeader
    });

    // 2. Resolve confirmed category and department
    const finalCategory = category || aiAnalysis.category || DEFAULT_CATEGORY;
    const finalDepartment = CATEGORY_DEPARTMENT_MAP[finalCategory] || 'General Municipal Administration';

    // 3. Deterministic Priority Calculation (Safety escalations & explainable factors)
    const priorityResult = calculatePriority({
      title,
      description,
      category: finalCategory
    });

    const nowIso = new Date().toISOString();
    const initialStatusHistory = [
      {
        status: 'Submitted',
        note: 'Complaint submitted by citizen',
        updatedBy: userId,
        timestamp: nowIso
      }
    ];

    // 4. PostgreSQL Insert Payload conforming to backend/supabase/schema.sql
    const insertPayload = {
      user_id: userId,
      title,
      description,
      category: finalCategory,
      ai_summary: aiAnalysis.summary || '',
      ai_keywords: aiAnalysis.keywords || [],
      ai_status: aiAnalysis.aiStatus || 'unavailable',
      priority: priorityResult.priority,
      priority_score: priorityResult.priorityScore,
      priority_reasons: priorityResult.priorityReasons,
      suggested_department: finalDepartment,
      status: 'Submitted',
      latitude,
      longitude,
      location_description: locationLabel || '',
      status_history: initialStatusHistory
    };

    const { data: newRow, error: insertError } = await supabase
      .from('complaints')
      .insert(insertPayload)
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 5. Duplicate Candidate Detection in Supabase (Haversine <= 300m, max 100 recent within 30 days)
    const duplicateCandidates = await detectAndSaveDuplicates(newRow.id, {
      ...newRow,
      keywords: aiAnalysis.keywords
    });

    const formattedComplaint = formatComplaintRow(newRow);

    res.status(201).json({
      success: true,
      data: {
        ...formattedComplaint,
        duplicateCandidatesCount: duplicateCandidates.length
      },
      message: 'Complaint submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/complaints/mine
 * List complaints submitted by the authenticated citizen from Supabase PostgreSQL.
 */
const getMyComplaints = async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const userId = req.user.id || req.user.uid;

    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const complaints = (data || []).map(formatComplaintRow);

    res.status(200).json({
      success: true,
      data: complaints,
      count: complaints.length,
      message: 'Citizen complaints retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/complaints
 * List all complaints across the platform from Supabase PostgreSQL (Admin Only).
 */
const getAllComplaints = async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(LIMITS.COMPLAINTS_QUERY_LIMIT);

    if (error) {
      throw error;
    }

    const complaints = (data || []).map(formatComplaintRow);

    res.status(200).json({
      success: true,
      data: complaints,
      count: complaints.length,
      message: 'All complaints retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/complaints/:id
 * Retrieve complaint details by ID (Owner or Admin) from Supabase PostgreSQL.
 */
const getComplaintById = async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;

    const { data: row, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Complaint not found'
        }
      });
    }

    // Permission check: owner or admin
    const userId = req.user.id || req.user.uid;
    if (!req.user.isAdmin && row.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this complaint'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: formatComplaintRow(row),
      message: 'Complaint details retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/complaints/:id/status
 * Update complaint status and append to status history (Admin Only) in Supabase PostgreSQL.
 */
const updateComplaintStatus = async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;
    const { status, note, department } = req.validatedStatusUpdate;

    const { data: row, error: fetchError } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Complaint not found'
        }
      });
    }

    const existingHistory = Array.isArray(row.status_history) ? row.status_history : [];
    const userId = req.user.id || req.user.uid;
    const nowIso = new Date().toISOString();

    const newHistoryEntry = {
      status,
      note: note || `Status updated to ${status}`,
      updatedBy: userId,
      timestamp: nowIso
    };

    // Bounded to latest 20 entries
    const updatedHistory = [...existingHistory, newHistoryEntry].slice(-LIMITS.STATUS_HISTORY_MAX_ENTRIES);

    const updatePayload = {
      status,
      status_history: updatedHistory,
      updated_at: nowIso
    };

    if (department) {
      updatePayload.suggested_department = department;
    }

    const { data: updatedRow, error: updateError } = await supabase
      .from('complaints')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.status(200).json({
      success: true,
      data: formatComplaintRow(updatedRow),
      message: 'Complaint status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/complaints/:id/analyze
 * Analyzes an existing complaint with Gemini AI.
 * Reuses existing analysis if already completed to prevent redundant API calls.
 */
const analyzeComplaintById = async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;

    const { data: row, error: fetchError } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Complaint not found'
        }
      });
    }

    // Permission check: owner or admin
    const userId = req.user.id || req.user.uid;
    if (!req.user.isAdmin && row.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to analyze this complaint'
        }
      });
    }

    // Reuse existing analysis if already completed (avoids unnecessary API calls)
    if (row.ai_status === 'completed' && req.query.force !== 'true') {
      return res.status(200).json({
        success: true,
        data: formatComplaintRow(row),
        message: 'Existing AI analysis reused'
      });
    }

    const testFailureHeader = req.headers['x-civicpulse-test-ai-failure'];
    const aiAnalysis = await analyzeComplaint({
      title: row.title,
      description: row.description,
      userCategory: row.category !== 'Other' ? row.category : null,
      testFailureHeader
    });

    const updatePayload = {
      ai_summary: aiAnalysis.summary || row.ai_summary || '',
      ai_keywords: aiAnalysis.keywords || [],
      suggested_department: aiAnalysis.suggestedDepartment || row.suggested_department,
      ai_status: aiAnalysis.aiStatus,
      updated_at: new Date().toISOString()
    };

    // If category was 'Other' and AI identified a valid category, update confirmed category & department
    if (row.category === 'Other' && aiAnalysis.category && aiAnalysis.category !== 'Other') {
      updatePayload.category = aiAnalysis.category;
      updatePayload.suggested_department = CATEGORY_DEPARTMENT_MAP[aiAnalysis.category] || row.suggested_department;
    }

    const { data: updatedRow, error: updateError } = await supabase
      .from('complaints')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.status(200).json({
      success: true,
      data: formatComplaintRow(updatedRow),
      message: 'AI analysis completed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/complaints/:id/duplicates
 * Retrieves recorded duplicate candidates for a complaint (Owner or Admin) from Supabase PostgreSQL.
 */
const getComplaintDuplicates = async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;

    const { data: row, error: fetchError } = await supabase
      .from('complaints')
      .select('id, user_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Complaint not found'
        }
      });
    }

    // Permission check: owner or admin
    const userId = req.user.id || req.user.uid;
    if (!req.user.isAdmin && row.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view duplicates for this complaint'
        }
      });
    }

    const duplicates = await getDuplicatesForComplaint(id);

    res.status(200).json({
      success: true,
      data: duplicates,
      count: duplicates.length,
      message: 'Duplicate candidates retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  analyzeComplaintById,
  getComplaintDuplicates
};
