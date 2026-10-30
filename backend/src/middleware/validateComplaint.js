const { ALLOWED_CATEGORIES, STATUS_LIFECYCLE, LIMITS } = require('../config/constants');

/**
 * Validation middleware for complaint submission (POST /api/complaints)
 */
const validateComplaintSubmission = (req, res, next) => {
  const { title, description, latitude, longitude, category, locationLabel } = req.body;

  // Title validation
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Complaint title is required'
      }
    });
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length > LIMITS.TITLE_MAX_LENGTH) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Title exceeds maximum length of ${LIMITS.TITLE_MAX_LENGTH} characters`
      }
    });
  }

  // Description validation
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Complaint description is required'
      }
    });
  }

  const trimmedDescription = description.trim();
  if (trimmedDescription.length > LIMITS.DESCRIPTION_MAX_LENGTH) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Description exceeds maximum length of ${LIMITS.DESCRIPTION_MAX_LENGTH} characters`
      }
    });
  }

  // Latitude and Longitude validation
  const parsedLat = parseFloat(latitude);
  const parsedLon = parseFloat(longitude);

  if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Valid latitude between -90 and 90 is required'
      }
    });
  }

  if (isNaN(parsedLon) || parsedLon < -180 || parsedLon > 180) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Valid longitude between -180 and 180 is required'
      }
    });
  }

  // Category validation (optional at submission, must be valid if passed)
  if (category && !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}`
      }
    });
  }

  // Sanitized body parameters attached for controller
  req.validatedComplaint = {
    title: trimmedTitle,
    description: trimmedDescription,
    latitude: parsedLat,
    longitude: parsedLon,
    category: category || null,
    locationLabel: typeof locationLabel === 'string' ? locationLabel.trim().substring(0, 200) : ''
  };

  next();
};

/**
 * Validation middleware for status updates (PATCH /api/complaints/:id/status)
 */
const validateStatusUpdate = (req, res, next) => {
  const { status, note, department } = req.body;

  if (!status || !STATUS_LIFECYCLE.includes(status)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Status is required and must be one of: ${STATUS_LIFECYCLE.join(', ')}`
      }
    });
  }

  // Rejection requires a mandatory reason
  if (status === 'Rejected' && (!note || typeof note !== 'string' || note.trim().length === 0)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'A rejection reason (note) is required when rejecting a complaint'
      }
    });
  }

  req.validatedStatusUpdate = {
    status,
    note: typeof note === 'string' ? note.trim().substring(0, 500) : '',
    department: typeof department === 'string' ? department.trim() : null
  };

  next();
};

module.exports = {
  validateComplaintSubmission,
  validateStatusUpdate
};
