/**
 * @fileoverview Rate Limiter Middleware
 * @description Configures different rate limits for various API endpoints
 * General: 100 req/15min, Analysis: 10 req/15min, Auth: 5 req/15min
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter — 100 requests per 15 minutes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 'fail',
    message: 'Too many requests. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Analysis endpoint rate limiter — 10 requests per 15 minutes
 * Stricter limit due to expensive AI API calls
 */
const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    status: 'fail',
    message: 'Analysis rate limit reached. You can analyze up to 10 articles every 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Auth endpoint rate limiter — 5 requests per 15 minutes
 * Prevents brute force login attempts
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 'fail',
    message: 'Too many authentication attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { generalLimiter, analysisLimiter, authLimiter };
