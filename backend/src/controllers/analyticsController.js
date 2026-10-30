const { getSupabaseAdmin } = require('../config/supabase');
const {
  ALLOWED_CATEGORIES,
  STATUS_LIFECYCLE,
  PRIORITY_LEVELS,
  LIMITS
} = require('../config/constants');
const { calculateHotspots, GRID_SIZE, MIN_COMPLAINTS_THRESHOLD } = require('../services/hotspotService');

/**
 * GET /api/analytics/overview
 * Returns dashboard metrics aggregated across recent complaints using Supabase PostgreSQL.
 * Admin-only endpoint.
 */
const getOverviewAnalytics = async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();

    // Query up to the approved bound limit (100 complaints) from PostgreSQL
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('id, status, category, priority, ai_status')
      .order('created_at', { ascending: false })
      .limit(LIMITS.COMPLAINTS_QUERY_LIMIT);

    if (error) {
      throw error;
    }

    // Initialize counters with zero to guarantee full distribution representation in dashboard UI
    const byStatus = {};
    STATUS_LIFECYCLE.forEach(status => { byStatus[status] = 0; });

    const byCategory = {};
    ALLOWED_CATEGORIES.forEach(category => { byCategory[category] = 0; });

    const byPriority = {};
    PRIORITY_LEVELS.forEach(priority => { byPriority[priority] = 0; });

    const byAiStatus = {
      completed: 0,
      unavailable: 0,
      failed: 0,
      pending: 0
    };

    let totalComplaints = 0;
    let highUrgencyCount = 0;
    let pendingActionCount = 0;

    (complaints || []).forEach(row => {
      totalComplaints += 1;

      // Status aggregation
      const status = row.status || 'Submitted';
      if (byStatus[status] !== undefined) {
        byStatus[status] += 1;
      } else {
        byStatus[status] = (byStatus[status] || 0) + 1;
      }

      if (status === 'Submitted' || status === 'Under Review') {
        pendingActionCount += 1;
      }

      // Category aggregation
      const category = row.category || 'Other';
      if (byCategory[category] !== undefined) {
        byCategory[category] += 1;
      } else {
        byCategory[category] = (byCategory[category] || 0) + 1;
      }

      // Priority aggregation
      const priority = row.priority || 'Medium';
      if (byPriority[priority] !== undefined) {
        byPriority[priority] += 1;
      } else {
        byPriority[priority] = (byPriority[priority] || 0) + 1;
      }

      if (priority === 'High' || priority === 'Critical') {
        highUrgencyCount += 1;
      }

      // AI status aggregation
      const aiStatus = row.ai_status || 'pending';
      if (byAiStatus[aiStatus] !== undefined) {
        byAiStatus[aiStatus] += 1;
      } else {
        byAiStatus[aiStatus] = (byAiStatus[aiStatus] || 0) + 1;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalComplaints,
        byStatus,
        byCategory,
        byPriority,
        byAiStatus,
        summary: {
          highUrgencyCount,
          pendingActionCount,
          resolvedCount: byStatus['Resolved'] || 0,
          inProgressCount: byStatus['In Progress'] || 0
        },
        metadata: {
          queryLimit: LIMITS.COMPLAINTS_QUERY_LIMIT,
          isSampleBounded: totalComplaints >= LIMITS.COMPLAINTS_QUERY_LIMIT,
          scopeNotice: `Aggregates represent the most recent bounded query records (up to ${LIMITS.COMPLAINTS_QUERY_LIMIT}), preserving free-tier performance.`
        }
      },
      message: 'Analytics overview retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/hotspots
 * Calculates in-memory geographic clusters from PostgreSQL complaint data.
 * Admin-only endpoint. Never persists calculations to database.
 */
const getHotspots = async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();

    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('id, latitude, longitude, category, status, priority')
      .order('created_at', { ascending: false })
      .limit(LIMITS.COMPLAINTS_QUERY_LIMIT);

    if (error) {
      throw error;
    }

    // Format rows for in-memory grid calculation
    const formattedComplaints = (complaints || []).map(row => ({
      id: row.id,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      category: row.category,
      status: row.status,
      priority: row.priority
    }));

    // Pure in-memory calculation (0.01 deg grid, >= 3 threshold)
    const hotspots = calculateHotspots(formattedComplaints);

    res.status(200).json({
      success: true,
      data: {
        hotspots,
        count: hotspots.length,
        parameters: {
          gridSizeDegrees: GRID_SIZE,
          threshold: MIN_COMPLAINTS_THRESHOLD,
          queryLimit: LIMITS.COMPLAINTS_QUERY_LIMIT,
          totalComplaintsEvaluated: formattedComplaints.length
        }
      },
      message: 'Geographic hotspots calculated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverviewAnalytics,
  getHotspots
};
