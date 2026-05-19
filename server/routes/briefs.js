/**
 * @fileoverview Briefs & Wire Routes
 * @description GET/POST /api/briefs, GET /api/wire
 */

const express = require('express');
const router = express.Router();
const { getBriefsHandler, saveBriefHandler, getWireHandler } = require('../controllers/briefsController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');

// GET /api/briefs — Get recent briefs (optional auth: returns all if no user)
router.get('/', optionalAuth, getBriefsHandler);

// POST /api/briefs — Save a brief (optional auth)
router.post('/', optionalAuth, saveBriefHandler);

// GET /api/wire — Today's Wire headlines (public)
router.get('/wire', getWireHandler);

module.exports = router;
