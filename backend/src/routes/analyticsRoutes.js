const express = require('express');
const router = express.Router();

const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const {
  getOverviewAnalytics,
  getHotspots
} = require('../controllers/analyticsController');

/**
 * @route   GET /api/analytics/overview
 * @desc    Get aggregated dashboard counts (status, category, priority, AI status)
 * @access  Admin Only
 */
router.get('/overview', requireAuth, requireAdmin, getOverviewAnalytics);

/**
 * @route   GET /api/analytics/hotspots
 * @desc    Get in-memory geographic complaint clusters (0.01 deg grid, >= 3 threshold)
 * @access  Admin Only
 */
router.get('/hotspots', requireAuth, requireAdmin, getHotspots);

module.exports = router;
