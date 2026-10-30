const express = require('express');
const router = express.Router();

/**
 * GET /api/health
 * Public health check endpoint
 * Returns: success, status, uptime, timestamp
 */
router.get('/health', (req, res) => {
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();

  res.status(200).json({
    success: true,
    status: 'ok',
    uptime: uptime,
    timestamp: timestamp,
    data: {
      status: 'ok',
      uptime: uptime,
      timestamp: timestamp
    },
    message: 'CivicPulse API is operational'
  });
});

module.exports = router;
