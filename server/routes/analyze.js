/**
 * @fileoverview Analyze Routes
 * @description POST /api/analyze — Article analysis endpoint
 */

const express = require('express');
const router = express.Router();
const { analyzeHandler, validateAnalyzeInput } = require('../controllers/analyzeController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { analysisLimiter } = require('../middleware/rateLimiter');

// POST /api/analyze — Analyze an article (rate limited, optional auth for saving)
router.post('/', analysisLimiter, optionalAuth, validateAnalyzeInput, analyzeHandler);

module.exports = router;
