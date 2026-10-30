const express = require('express');
const router = express.Router();

const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const {
  validateComplaintSubmission,
  validateStatusUpdate
} = require('../middleware/validateComplaint');
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  analyzeComplaintById,
  getComplaintDuplicates
} = require('../controllers/complaintController');

/**
 * @route   POST /api/complaints
 * @desc    Submit a new civic complaint
 * @access  Authenticated (Citizen / Admin)
 */
router.post('/', requireAuth, validateComplaintSubmission, createComplaint);

/**
 * @route   GET /api/complaints/mine
 * @desc    List complaints created by the logged-in user
 * @access  Authenticated (Citizen / Admin)
 */
router.get('/mine', requireAuth, getMyComplaints);

/**
 * @route   GET /api/complaints
 * @desc    List all complaints across the municipality
 * @access  Admin Only
 */
router.get('/', requireAuth, requireAdmin, getAllComplaints);

/**
 * @route   GET /api/complaints/:id
 * @desc    Get detailed complaint by ID
 * @access  Authenticated (Owner or Admin)
 */
router.get('/:id', requireAuth, getComplaintById);

/**
 * @route   GET /api/complaints/:id/duplicates
 * @desc    Get detected duplicate candidate records for a complaint
 * @access  Authenticated (Owner or Admin)
 */
router.get('/:id/duplicates', requireAuth, getComplaintDuplicates);

/**
 * @route   POST /api/complaints/:id/analyze
 * @desc    Trigger AI analysis for an existing complaint
 * @access  Authenticated (Owner or Admin)
 */
router.post('/:id/analyze', requireAuth, analyzeComplaintById);

/**
 * @route   PATCH /api/complaints/:id/status
 * @desc    Update complaint status and record history note
 * @access  Admin Only
 */
router.patch('/:id/status', requireAuth, requireAdmin, validateStatusUpdate, updateComplaintStatus);

module.exports = router;
