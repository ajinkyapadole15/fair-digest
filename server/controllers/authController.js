/**
 * @fileoverview Auth Controller
 * @description Handles user registration and login with JWT tokens
 * POST /api/auth/register, POST /api/auth/login
 */

const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Generate JWT token for a user
 * @param {Object} user - User document from MongoDB
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Validation rules for registration
 */
const validateRegister = [
  body('username')
    .isString().trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3–30 characters'),
  body('email')
    .isEmail().normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

/**
 * Validation rules for login
 */
const validateLogin = [
  body('email')
    .isEmail().normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * POST /api/auth/register — Create a new user account
 */
async function registerHandler(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array().map(e => e.msg).join(', '), 400);
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      throw new AppError(
        existingUser.email === email
          ? 'An account with this email already exists'
          : 'This username is already taken',
        409
      );
    }

    // Create user (password hashed by pre-save hook)
    const user = new User({
      username,
      email,
      passwordHash: password
    });
    await user.save();

    const token = generateToken(user);

    logger.info(`New user registered: ${username}`);

    res.status(201).json({
      status: 'success',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    next(error instanceof AppError ? error : new AppError(error.message, 500));
  }
}

/**
 * POST /api/auth/login — Authenticate user and return JWT
 */
async function loginHandler(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array().map(e => e.msg).join(', '), 400);
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user);

    logger.info(`User logged in: ${user.username}`);

    res.status(200).json({
      status: 'success',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    next(error instanceof AppError ? error : new AppError(error.message, 500));
  }
}

module.exports = { registerHandler, loginHandler, validateRegister, validateLogin };
