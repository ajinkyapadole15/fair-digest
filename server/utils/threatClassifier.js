/**
 * @fileoverview Threat Classifier Utility
 * @description Rule-based threat classification engine for news source domains
 * Classifies sources into GREEN/YELLOW/ORANGE/RED threat levels with risk scores
 */

const { getBaseDomain } = require('./domainParser');

/**
 * Threat level definitions
 * @constant
 */
const THREAT_LEVELS = {
  GREEN: { label: 'Trusted Source', color: '#22c55e', range: '0–20' },
  YELLOW: { label: 'Moderate Risk — Verify', color: '#eab308', range: '21–55' },
  ORANGE: { label: 'High Bias — Caution', color: '#f97316', range: '56–75' },
  RED: { label: 'Potential Threat — Disinformation Risk', color: '#ef4444', range: '76–100' }
};

/**
 * GREEN — Trusted, established major news outlets
 * @constant {Set<string>}
 */
const TRUSTED_DOMAINS = new Set([
  'reuters.com', 'apnews.com', 'bbc.com', 'bbc.co.uk',
  'nytimes.com', 'theguardian.com', 'washingtonpost.com',
  'wsj.com', 'economist.com', 'ft.com', 'bloomberg.com',
  'npr.org', 'pbs.org', 'cnn.com', 'abcnews.go.com',
  'cbsnews.com', 'nbcnews.com', 'usatoday.com',
  'thehill.com', 'politico.com', 'c-span.org',
  'aljazeera.com', 'france24.com', 'dw.com',
  'timesofindia.indiatimes.com', 'hindustantimes.com',
  'thehindu.com', 'ndtv.com', 'news.yahoo.com',
  'news.google.com', 'snopes.com', 'factcheck.org',
  'politifact.com', 'nature.com', 'sciencemag.org',
  'wired.com', 'arstechnica.com', 'techcrunch.com'
]);

/**
 * YELLOW — Known lean/opinion-heavy but not disinformation
 * @constant {Set<string>}
 */
const MODERATE_RISK_DOMAINS = new Set([
  'foxnews.com', 'msnbc.com', 'huffpost.com',
  'dailymail.co.uk', 'nypost.com', 'buzzfeednews.com',
  'vice.com', 'vox.com', 'theintercept.com',
  'jacobin.com', 'nationalreview.com', 'reason.com',
  'salon.com', 'slate.com', 'thedailybeast.com',
  'newsmax.com', 'oann.com', 'thefederalist.com',
  'motherjones.com', 'commondreams.org', 'dailykos.com',
  'townhall.com', 'theblaze.com', 'washingtontimes.com'
]);

/**
 * RED — Known fake news, disinformation, or propaganda domains (sample list)
 * @constant {Set<string>}
 */
const DISINFORMATION_DOMAINS = new Set([
  'infowars.com', 'naturalnews.com', 'beforeitsnews.com',
  'worldtruth.tv', 'yournewswire.com', 'neonnettle.com',
  'thegatewaypundit.com', 'zerohedge.com', 'globalresearch.ca',
  'rt.com', 'sputniknews.com', 'tass.com',
  'presstv.ir', 'xinhuanet.com', 'globaltimes.cn',
  'veteranstoday.com', 'newspunch.com', 'collectiveevolution.com',
  'davidicke.com', 'wakingtimes.com', 'truththeory.com',
  'thefreethoughtproject.com', 'activistpost.com'
]);

/**
 * Countries with known state media control
 * @constant {Set<string>}
 */
const HIGH_RISK_COUNTRIES = new Set([
  'Russia', 'China', 'Iran', 'North Korea', 'Syria',
  'Belarus', 'Venezuela', 'Cuba', 'Turkmenistan', 'Eritrea'
]);

/**
 * ASN patterns associated with suspicious hosting
 * @constant {string[]}
 */
const SUSPICIOUS_ASN_KEYWORDS = [
  'bulletproof', 'offshore', 'anonymous', 'privacy'
];

/**
 * Classify a news source domain based on rule-based threat assessment
 * @param {string} domain - The domain to classify
 * @param {Object} ipInfo - IP geolocation data
 * @param {string} ipInfo.country - Country of the IP
 * @param {string} ipInfo.asn - ASN string
 * @param {string} ipInfo.isp - ISP name
 * @returns {Object} Classification { threatLevel, riskScore, signals, notes }
 */
function classifyDomain(domain, ipInfo = {}) {
  const baseDomain = domain.replace(/^www\./, '');
  const signals = [];
  let riskScore = 50; // Default moderate

  // ── Check trusted domains ──────────────────────
  if (TRUSTED_DOMAINS.has(baseDomain)) {
    return {
      threatLevel: 'GREEN',
      riskScore: Math.floor(Math.random() * 15) + 5, // 5-19
      signals: ['Domain is in trusted major news outlets list'],
      notes: 'Established, reputable news organization with editorial standards.'
    };
  }

  // ── Check disinformation domains ───────────────
  if (DISINFORMATION_DOMAINS.has(baseDomain)) {
    signals.push('Domain is in known disinformation/propaganda list');
    riskScore = Math.floor(Math.random() * 20) + 80; // 80-99
    return {
      threatLevel: 'RED',
      riskScore,
      signals,
      notes: 'Known source of disinformation, propaganda, or consistently unreliable reporting.'
    };
  }

  // ── Check moderate risk domains ────────────────
  if (MODERATE_RISK_DOMAINS.has(baseDomain)) {
    signals.push('Domain is known for opinion-heavy or partisan content');
    riskScore = Math.floor(Math.random() * 25) + 30; // 30-54
    return {
      threatLevel: 'YELLOW',
      riskScore,
      signals,
      notes: 'Source has known political lean or editorial bias. Cross-reference recommended.'
    };
  }

  // ── Unknown domain — score based on signals ────
  signals.push('Domain not found in any known classification list');
  riskScore = 40; // Start at moderate

  // Check IP geolocation risk
  if (ipInfo.country && HIGH_RISK_COUNTRIES.has(ipInfo.country)) {
    signals.push(`IP located in high-risk country: ${ipInfo.country}`);
    riskScore += 20;
  }

  // Check ASN reputation
  if (ipInfo.asn) {
    const asnLower = ipInfo.asn.toLowerCase();
    for (const keyword of SUSPICIOUS_ASN_KEYWORDS) {
      if (asnLower.includes(keyword)) {
        signals.push(`Suspicious ASN detected: ${ipInfo.asn}`);
        riskScore += 15;
        break;
      }
    }
  }

  // Check if domain looks suspicious (very long, lots of hyphens, etc.)
  if (baseDomain.split('-').length > 3) {
    signals.push('Domain contains excessive hyphens (common in fake news sites)');
    riskScore += 10;
  }

  if (baseDomain.length > 30) {
    signals.push('Unusually long domain name');
    riskScore += 5;
  }

  // TLD checks
  const suspiciousTLDs = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.buzz', '.click'];
  if (suspiciousTLDs.some(tld => baseDomain.endsWith(tld))) {
    signals.push(`Suspicious TLD detected in ${baseDomain}`);
    riskScore += 15;
  }

  // Clamp score
  riskScore = Math.max(0, Math.min(100, riskScore));

  // Determine threat level from score
  let threatLevel;
  if (riskScore <= 20) threatLevel = 'GREEN';
  else if (riskScore <= 55) threatLevel = 'YELLOW';
  else if (riskScore <= 75) threatLevel = 'ORANGE';
  else threatLevel = 'RED';

  return {
    threatLevel,
    riskScore,
    signals,
    notes: `Unknown domain classified based on ${signals.length} signal(s).`
  };
}

module.exports = { classifyDomain, THREAT_LEVELS, TRUSTED_DOMAINS, DISINFORMATION_DOMAINS, MODERATE_RISK_DOMAINS };
