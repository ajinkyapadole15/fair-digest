/**
 * @fileoverview Auth Routes
 * @description POST /api/auth/register, POST /api/auth/login
 */

const express = require('express');
const router = express.Router();
const { registerHandler, loginHandler, validateRegister, validateLogin } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/register — Create new account
router.post('/register', authLimiter, validateRegister, registerHandler);

// POST /api/auth/login — Authenticate and get JWT
router.post('/login', authLimiter, validateLogin, loginHandler);

module.exports = router;
