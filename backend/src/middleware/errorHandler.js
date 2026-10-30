/**
 * Centralized Error Handling Middleware
 * Formats errors according to the CivicPulse approved API response specification:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "ERROR_CODE",
 *     "message": "Human-readable description"
 *   }
 * }
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');
  const message = err.message || 'An unexpected error occurred';

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error(`[Error] ${errorCode}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message
    }
  });
};

module.exports = errorHandler;
