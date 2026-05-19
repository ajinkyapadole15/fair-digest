/**
 * @fileoverview Brief Model — Mongoose Schema
 * @description Stores analyzed article briefs with all AI analysis results
 * Schema: { userId, url, title, summary, bias, sentiment, factSignals, counterpoints, sourceIntel, model, createdAt }
 */

const mongoose = require('mongoose');

const factSignalSchema = new mongoose.Schema({
  claim: { type: String, required: true },
  confidence: { type: Number, min: 0, max: 100 },
  checkable: { type: Boolean, default: true }
}, { _id: false });

const sourceIntelSchema = new mongoose.Schema({
  domain: String,
  ip: String,
  country: String,
  city: String,
  isp: String,
  org: String,
  asn: String,
  threatLevel: {
    type: String,
    enum: ['GREEN', 'YELLOW', 'ORANGE', 'RED'],
    default: 'YELLOW'
  },
  riskScore: { type: Number, min: 0, max: 100, default: 50 },
  signals: [String],
  isHttps: Boolean,
  credibilityNotes: String
}, { _id: false });

const briefSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  url: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    trim: true,
    default: 'Untitled Brief'
  },
  summary: {
    type: String,
    required: true
  },
  bias: {
    score: { type: Number, min: -100, max: 100, default: 0 },
    label: {
      type: String,
      enum: ['Far Left', 'Left', 'Center-Left', 'Center', 'Center-Right', 'Right', 'Far Right'],
      default: 'Center'
    }
  },
  sentiment: {
    label: {
      type: String,
      enum: ['Positive', 'Negative', 'Neutral', 'Mixed'],
      default: 'Neutral'
    },
    score: { type: Number, min: 0, max: 100, default: 50 }
  },
  factSignals: [factSignalSchema],
  counterpoints: [String],
  sourceIntel: sourceIntelSchema,
  model: {
    type: String,
    default: 'claude-sonnet-4-5'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for efficient user-specific queries sorted by date
briefSchema.index({ userId: 1, createdAt: -1 });

const Brief = mongoose.model('Brief', briefSchema);

module.exports = Brief;
