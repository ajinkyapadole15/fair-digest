/**
 * @fileoverview Briefs & Wire Controller
 * @description Handles brief CRUD operations and Today's Wire news feed
 * GET/POST /api/briefs, GET /api/wire
 */

const axios = require('axios');
const Brief = require('../models/Brief');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const NodeCache = require('node-cache');
const mongoose = require('mongoose');

// Cache wire headlines for 30 minutes
const wireCache = new NodeCache({ stdTTL: 1800 });

// In-memory fallback if MongoDB is not available
const inMemoryBriefs = [];

/**
 * GET /api/briefs — Retrieve recent briefs for authenticated user
 * Returns last 10 briefs sorted by creation date (newest first)
 */
async function getBriefsHandler(req, res, next) {
  try {
    // Use in-memory fallback if DB is not connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        status: 'success',
        results: inMemoryBriefs.length,
        data: inMemoryBriefs
      });
    }

    const query = req.user ? { userId: req.user.id } : {};
    const briefs = await Brief.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title url model bias.label sentiment.label createdAt')
      .lean();

    res.status(200).json({
      status: 'success',
      results: briefs.length,
      data: briefs
    });
  } catch (error) {
    next(new AppError('Failed to retrieve briefs', 500));
  }
}

/**
 * POST /api/briefs — Save a new brief
 */
async function saveBriefHandler(req, res, next) {
  try {
    const briefData = {
      ...req.body,
      userId: req.user ? req.user.id : null
    };

    // Use in-memory fallback if DB is not connected
    if (mongoose.connection.readyState !== 1) {
      const fallbackBrief = { _id: Date.now().toString(), ...briefData, createdAt: new Date() };
      inMemoryBriefs.unshift(fallbackBrief);
      if (inMemoryBriefs.length > 15) inMemoryBriefs.pop(); // Keep last 15
      return res.status(201).json({ status: 'success', data: fallbackBrief });
    }

    const brief = new Brief(briefData);
    await brief.save();

    logger.info(`Brief saved: ${brief._id}`);

    res.status(201).json({
      status: 'success',
      data: brief
    });
  } catch (error) {
    next(new AppError('Failed to save brief: ' + error.message, 500));
  }
}

/**
 * GET /api/wire — Fetch today's top headlines
 * Uses NewsAPI.org free tier with caching
 * Falls back to hardcoded headlines if API unavailable
 */
async function getWireHandler(req, res, next) {
  try {
    // Check cache first
    const cached = wireCache.get('headlines');
    if (cached) {
      return res.status(200).json({
        status: 'success',
        source: 'cache',
        data: cached
      });
    }

    let headlines = [];

    // Try NewsAPI
    if (process.env.NEWS_API_KEY) {
      try {
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
          params: {
            country: 'us',
            pageSize: 30,
            apiKey: process.env.NEWS_API_KEY
          },
          timeout: 5000
        });

        if (response.data.articles) {
          headlines = response.data.articles.map(article => ({
            title: article.title,
            source: article.source?.name || 'Unknown',
            url: article.url,
            publishedAt: article.publishedAt,
            description: article.description
          }));
        }
      } catch (apiErr) {
        logger.warn('NewsAPI fetch failed:', apiErr.message);
      }
    }

    // Fallback headlines if API fails
    if (headlines.length === 0) {
      headlines = getFallbackHeadlines();
    }

    // Cache the results
    wireCache.set('headlines', headlines);

    res.status(200).json({
      status: 'success',
      source: headlines[0]?.fallback ? 'fallback' : 'newsapi',
      results: headlines.length,
      data: headlines
    });

  } catch (error) {
    next(new AppError('Failed to fetch news wire', 500));
  }
}

/**
 * Fallback headlines when NewsAPI is unavailable
 * @returns {Array<Object>} Sample headlines
 */
function getFallbackHeadlines() {
  const baseHeadlines = [
    { title: 'Global Climate Summit Reaches Historic Agreement on Carbon Emissions', source: 'Reuters' },
    { title: 'Tech Giants Report Record Quarterly Earnings Amid AI Boom', source: 'Bloomberg' },
    { title: 'Central Banks Signal Potential Rate Cuts in Coming Months', source: 'Financial Times' },
    { title: 'New Study Reveals Breakthrough in Cancer Treatment Research', source: 'Nature' },
    { title: 'International Space Station Marks 25 Years of Continuous Habitation', source: 'NASA' },
    { title: 'Global Supply Chain Disruptions Ease as Shipping Routes Normalize', source: 'WSJ' },
    { title: 'UNESCO Adds New Sites to World Heritage List', source: 'BBC' },
    { title: 'Electric Vehicle Sales Surpass Combustion Engines in Major Markets', source: 'The Guardian' },
    { title: 'Cybersecurity Experts Warn of Rising State-Sponsored Attacks', source: 'Wired' },
    { title: 'Major Infrastructure Bill Passes Senate with Bipartisan Support', source: 'AP News' },
    { title: 'Renewable Energy Overtakes Fossil Fuels in Key European Markets', source: 'Reuters' },
    { title: 'AI Startup Valuations Soar After Breakthrough in General Intelligence', source: 'TechCrunch' },
    { title: 'Global Markets Rally as Inflation Cools Faster Than Expected', source: 'Bloomberg' },
    { title: 'Ocean Cleanup Project Successfully Removes 10,000 Tons of Plastic', source: 'National Geographic' },
    { title: 'New Quantum Computer Solves Complex Math Problem in Seconds', source: 'MIT Tech Review' }
  ];

  // Duplicate and slightly modify to create 30 items
  const extended = [];
  for (let i = 0; i < 30; i++) {
    const base = baseHeadlines[i % baseHeadlines.length];
    extended.push({
      title: i >= baseHeadlines.length ? `[Update] ${base.title}` : base.title,
      source: base.source,
      url: getUrlForSource(base.source),
      publishedAt: new Date(Date.now() - (i * 1800000)).toISOString(), // staggered times
      fallback: true
    });
  }
  return extended;
}

function getUrlForSource(source) {
  const sourceUrls = {
    'Reuters': 'https://www.reuters.com',
    'Bloomberg': 'https://www.bloomberg.com',
    'Financial Times': 'https://www.ft.com',
    'Nature': 'https://www.nature.com',
    'NASA': 'https://www.nasa.gov',
    'WSJ': 'https://www.wsj.com',
    'BBC': 'https://www.bbc.com',
    'The Guardian': 'https://www.theguardian.com',
    'Wired': 'https://www.wired.com',
    'AP News': 'https://apnews.com',
    'TechCrunch': 'https://techcrunch.com',
    'National Geographic': 'https://www.nationalgeographic.com',
    'MIT Tech Review': 'https://www.technologyreview.com'
  };
  return sourceUrls[source] || 'https://news.google.com';
}

module.exports = { getBriefsHandler, saveBriefHandler, getWireHandler, inMemoryBriefs };
