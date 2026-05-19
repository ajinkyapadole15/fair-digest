/**
 * @fileoverview Threat Analysis Service
 * @description Combines rule-based classification with AI assessment
 * to categorize news source threat levels
 */

const { classifyDomain, THREAT_LEVELS } = require('../utils/threatClassifier');
const { assessCredibility } = require('./claudeService');
const { logger } = require('../utils/logger');

/**
 * Perform full threat analysis on a news source
 * @param {string} domain - The source domain
 * @param {Object} ipInfo - IP geolocation data from ipService
 * @param {string} url - Original URL (for HTTPS check)
 * @returns {Promise<Object>} Threat assessment { threatLevel, riskScore, signals, credibilityNotes }
 */
async function analyzeThreat(domain, ipInfo, url) {
  try {
    logger.info(`Running threat analysis for: ${domain}`);

    // Step 1: Rule-based classification
    const ruleResult = classifyDomain(domain, ipInfo);
    
    // Step 2: AI-based credibility assessment
    let aiResult = { credibilityScore: 50, assessment: '', flags: [] };
    try {
      aiResult = await assessCredibility(domain, ipInfo);
    } catch (err) {
      logger.warn('AI credibility assessment skipped:', err.message);
    }

    // Step 3: Combine signals
    const signals = [...ruleResult.signals];
    
    // Check HTTPS
    const isHttps = url.startsWith('https://');
    if (!isHttps) {
      signals.push('Site does not use HTTPS encryption');
    }

    // Add AI flags
    if (aiResult.flags && aiResult.flags.length > 0) {
      signals.push(...aiResult.flags.map(f => `AI Flag: ${f}`));
    }

    // Step 4: Calculate combined risk score
    // Weight: 60% rule-based, 40% AI assessment (inverted — credibility to risk)
    const aiRisk = 100 - (aiResult.credibilityScore || 50);
    const combinedScore = Math.round(ruleResult.riskScore * 0.6 + aiRisk * 0.4);
    const finalScore = Math.max(0, Math.min(100, combinedScore));

    // Step 5: Determine final threat level based on combined score
    let threatLevel;
    if (finalScore <= 20) {
      threatLevel = 'GREEN';
    } else if (finalScore <= 55) {
      threatLevel = 'YELLOW';
    } else if (finalScore <= 75) {
      threatLevel = 'ORANGE';
    } else {
      threatLevel = 'RED';
    }

    const scoreBreakdown = {
      domainReputation: ruleResult.riskScore,
      contentBias: aiRisk,
      factuality: Math.max(0, Math.min(100, Math.round(ruleResult.riskScore * 0.4 + aiRisk * 0.6))) // Derived estimation
    };

    const result = {
      threatLevel,
      riskScore: finalScore,
      scoreBreakdown,
      signals,
      credibilityNotes: aiResult.assessment || ruleResult.notes,
      isHttps,
      ruleBasedScore: ruleResult.riskScore,
      aiCredibilityScore: aiResult.credibilityScore
    };

    logger.info(`Threat analysis complete: ${domain} → ${threatLevel} (score: ${finalScore})`);
    return result;

  } catch (error) {
    logger.error(`Threat analysis error for ${domain}:`, error.message);
    return {
      threatLevel: 'YELLOW',
      riskScore: 50,
      scoreBreakdown: { domainReputation: 50, contentBias: 50, factuality: 50 },
      signals: ['Threat analysis encountered an error — defaulting to moderate risk'],
      credibilityNotes: 'Unable to complete full threat analysis',
      isHttps: url.startsWith('https://'),
      ruleBasedScore: 50,
      aiCredibilityScore: 50
    };
  }
}

module.exports = { analyzeThreat, THREAT_LEVELS };
