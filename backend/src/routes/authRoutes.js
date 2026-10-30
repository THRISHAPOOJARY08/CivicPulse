const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

/**
 * GET /api/me
 * Authenticated endpoint: Returns profile and role of the current user
 */
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user.id,
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      isAdmin: req.user.isAdmin
    },
    message: 'User profile retrieved successfully'
  });
});

/**
 * GET /api/admin/verify
 * Admin-only verification endpoint: Confirms administrator access
 */
router.get('/admin/verify', requireAuth, requireAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user.id,
      uid: req.user.uid,
      email: req.user.email,
      role: req.user.role
    },
    message: 'Administrator authorization verified'
  });
});

module.exports = router;
