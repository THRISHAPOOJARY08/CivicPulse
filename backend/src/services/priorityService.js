const { PRIORITY_LEVELS } = require('../config/constants');

/**
 * Severe Hazards Patterns (+35 points & potential Critical escalation)
 */
const SEVERE_HAZARDS = [
  /\b(?:live|open|fallen|hanging|exposed)\s+(?:electric|electrical)?\s*(?:wire|cable)\b/i,
  /\b(?:electric|electrical)\s+shock\b/i,
  /\b(?:transformer)\s+(?:spark|fire|blast|explosion)\b/i,
  /\b(?:gas|lpg|chemical|toxic)\s+(?:leak|leakage|fumes|poison)\b/i,
  /\b(?:collapse|collapsing|cave-?in|sinkhole)\b/i,
  /\bopen\s+manhole\b/i,
  /\b(?:severe|flash)\s+flood(?:ing)?\b/i
];

/**
 * Safety Risk Patterns (+25 points)
 */
const SAFETY_RISKS = [
  /\b(?:accident|injur(?:y|ed)|hazard|danger|dangerous|fatal|death)\b/i,
  /\b(?:fire|flame|burning)\b/i,
  /\b(?:deep\s+pothole|huge\s+pothole|large\s+crater)\b/i,
  /\b(?:falling|slippery|broken\s+glass|sharp\s+metal)\b/i,
  /\b(?:sewage\s+overflow|drainage\s+burst)\b/i,
  /\b(?:uncovered|broken)\s+(?:drain|slab|lid)\b/i
];

/**
 * Multiple People Affected Patterns (+15 points)
 */
const PUBLIC_LOCATION_RISKS = [
  /\b(?:school|college|kindergarten|daycare)\b/i,
  /\b(?:hospital|clinic|health\s+center)\b/i,
  /\b(?:market|bazaar|mall|commercial\s+area)\b/i,
  /\b(?:bus\s+(?:stop|stand)|metro|train|railway\s+station)\b/i,
  /\b(?:main\s+road|highway|junction|crossroad|flyover)\b/i,
  /\b(?:crowd|pedestrians|commuters|residents)\b/i
];

/**
 * Significant Public Disruption Patterns (+15 points)
 */
const PUBLIC_DISRUPTIONS = [
  /\b(?:traffic\s+(?:jam|block|gridlock|congestion)|blocked\s+road|road\s+closed)\b/i,
  /\b(?:no\s+water|water\s+(?:cut|stoppage|shortage)|pipeline\s+burst)\b/i,
  /\b(?:power\s+(?:cut|outage|failure)|blackout|complete\s+darkness)\b/i,
  /\b(?:entire\s+area|whole\s+street|all\s+houses)\b/i
];

/**
 * Deterministically calculates complaint priority score (0-100) and priority level.
 * Safety escalation: Severe hazards automatically trigger High (>=40) or Critical (>=60).
 * 
 * @param {Object} complaint
 * @param {string} complaint.title
 * @param {string} complaint.description
 * @param {string} complaint.category
 * @returns {Object} { priority, priorityScore, priorityReasons }
 */
const calculatePriority = ({ title = '', description = '', category = '' }) => {
  const combinedText = `${title} ${description}`.toLowerCase();
  
  let score = 5; // Baseline routine civic inconvenience
  const reasons = ['Baseline civic inconvenience (+5)'];

  let hasSevereHazard = false;
  let hasSafetyRisk = false;
  let hasPublicLocation = false;
  let hasPublicDisruption = false;

  // 1. Explicit severe or immediate hazard (+35)
  for (const pattern of SEVERE_HAZARDS) {
    if (pattern.test(combinedText)) {
      hasSevereHazard = true;
      score += 35;
      reasons.push('Explicit severe or immediate public hazard detected (+35)');
      break;
    }
  }

  // 2. Possible safety risk (+25)
  for (const pattern of SAFETY_RISKS) {
    if (pattern.test(combinedText)) {
      hasSafetyRisk = true;
      score += 25;
      reasons.push('Identified potential public safety or health risk (+25)');
      break;
    }
  }

  // 3. Multiple people potentially affected / Critical public location (+15)
  for (const pattern of PUBLIC_LOCATION_RISKS) {
    if (pattern.test(combinedText)) {
      hasPublicLocation = true;
      score += 15;
      reasons.push('Location near sensitive or high-density public area (+15)');
      break;
    }
  }

  // 4. Significant public disruption (+15)
  for (const pattern of PUBLIC_DISRUPTIONS) {
    if (pattern.test(combinedText)) {
      hasPublicDisruption = true;
      score += 15;
      reasons.push('Causes substantial public service or traffic disruption (+15)');
      break;
    }
  }

  // Safety escalation rule: Explicit severe hazards must be at least High (>= 40),
  // and severe hazards combined with public locations or safety risks must be Critical (>= 60).
  if (hasSevereHazard) {
    if (hasPublicLocation || hasSafetyRisk || hasPublicDisruption) {
      if (score < 60) {
        score = 60;
        reasons.push('Safety escalation: Severe hazard in public area elevated to Critical (minimum 60)');
      }
    } else if (score < 40) {
      score = 40;
      reasons.push('Safety escalation: Severe hazard elevated to High (minimum 40)');
    }
  }

  // Clamp score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine priority band according to approved documentation
  // 0–19: Low, 20–39: Medium, 40–59: High, 60–100: Critical
  let priority = 'Medium';
  if (finalScore >= 60) {
    priority = 'Critical';
  } else if (finalScore >= 40) {
    priority = 'High';
  } else if (finalScore >= 20) {
    priority = 'Medium';
  } else {
    priority = 'Low';
  }

  return {
    priority,
    priorityScore: finalScore,
    priorityReasons: reasons
  };
};

module.exports = {
  calculatePriority
};
