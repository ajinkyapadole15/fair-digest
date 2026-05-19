/**
 * @fileoverview Global Error Handler Middleware
 * @description Custom AppError class and centralized error handling
 * Provides different error responses for development vs production
 */

const { logger } = require('../utils/logger');

/**
 * Custom application error class
 * @extends Error
 */
class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 * @param {Error} err - The error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
function globalErrorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`${err.statusCode} - ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    stack: err.stack
  });

  if (process.env.NODE_ENV === 'production') {
    // Production: send clean error
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // Programming or unknown error
      res.status(500).json({
        status: 'error',
        message: err.message,
        stack: err.stack
      });
    }
  } else {
    // Development: send detailed error
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  }
}

module.exports = { AppError, globalErrorHandler };
