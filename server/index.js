/**
 * @fileoverview The Fair Digest — Express Server Entry Point
 * @description 3-tier architecture: Presentation (React) → Business Logic (Express) → Data (MongoDB)
 * Implements: Helmet security, CORS, rate limiting, Morgan/Winston logging, global error handling
 */

// Load .env from server dir (Render) or parent dir (local monorepo dev)
const path = require('path');
const envPath = require('fs').existsSync(path.join(__dirname, '.env'))
  ? path.join(__dirname, '.env')
  : path.join(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { logger } = require('./utils/logger');
const { globalErrorHandler, AppError } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Route imports
const analyzeRoutes = require('./routes/analyze');
const authRoutes = require('./routes/auth');
const briefsRoutes = require('./routes/briefs');

const app = express();
const PORT = process.env.PORT || 5000;

// ═══════════════════════════════════════
// SECURITY MIDDLEWARE
// ═══════════════════════════════════════
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ═══════════════════════════════════════
// PARSING & LOGGING MIDDLEWARE
// ═══════════════════════════════════════
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// ═══════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════
app.use(generalLimiter);

// ═══════════════════════════════════════
// API ROUTES (MVC Pattern)
// ═══════════════════════════════════════
app.use('/api/analyze', analyzeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/briefs', briefsRoutes);

// Direct mount for wire to avoid route overlap
const { getWireHandler } = require('./controllers/briefsController');
app.get('/api/wire', getWireHandler);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'The Fair Digest API',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// ═══════════════════════════════════════
// GLOBAL ERROR HANDLER
// ═══════════════════════════════════════
app.use(globalErrorHandler);

// ═══════════════════════════════════════
// DATABASE CONNECTION & SERVER START
// ═══════════════════════════════════════
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fairdigest';

mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      logger.info(`🚀 The Fair Digest API running on port ${PORT}`);
      logger.info(`📰 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    logger.error('❌ MongoDB connection error:', err.message);
    // Start server anyway for non-DB routes
    app.listen(PORT, () => {
      logger.warn(`⚠️ Server started WITHOUT database on port ${PORT}`);
    });
  });

module.exports = app;
