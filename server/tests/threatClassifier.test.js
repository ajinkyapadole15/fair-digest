/**
 * @fileoverview Unit Tests — Threat Classifier & Domain Parser
 * @description Jest tests for utility functions
 */

const { classifyDomain, TRUSTED_DOMAINS, DISINFORMATION_DOMAINS } = require('../utils/threatClassifier');
const { extractDomain, getBaseDomain, isValidUrl } = require('../utils/domainParser');

// ═══════════════════════════════════════════════
// Domain Parser Tests
// ═══════════════════════════════════════════════

describe('Domain Parser', () => {
  describe('extractDomain', () => {
    test('extracts domain from HTTPS URL', () => {
      expect(extractDomain('https://www.bbc.com/news/article')).toBe('www.bbc.com');
    });

    test('extracts domain from HTTP URL', () => {
      expect(extractDomain('http://reuters.com/world')).toBe('reuters.com');
    });

    test('adds protocol if missing', () => {
      expect(extractDomain('bbc.com/news')).toBe('bbc.com');
    });

    test('returns null for empty input', () => {
      expect(extractDomain('')).toBeNull();
      expect(extractDomain(null)).toBeNull();
      expect(extractDomain(undefined)).toBeNull();
    });

    test('returns null for invalid URL', () => {
      expect(extractDomain('not a url at all')).toBeNull();
    });
  });

  describe('getBaseDomain', () => {
    test('removes www prefix', () => {
      expect(getBaseDomain('https://www.bbc.com/news')).toBe('bbc.com');
    });

    test('returns domain without www unchanged', () => {
      expect(getBaseDomain('https://reuters.com')).toBe('reuters.com');
    });
  });

  describe('isValidUrl', () => {
    test('validates correct URLs', () => {
      expect(isValidUrl('https://www.bbc.com')).toBe(true);
      expect(isValidUrl('http://reuters.com/article')).toBe(true);
      expect(isValidUrl('bbc.com')).toBe(true);
    });

    test('rejects invalid URLs', () => {
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl(null)).toBe(false);
      expect(isValidUrl('just some text')).toBe(false);
    });
  });
});

// ═══════════════════════════════════════════════
// Threat Classifier Tests
// ═══════════════════════════════════════════════

describe('Threat Classifier', () => {
  describe('classifyDomain — Trusted Sources (GREEN)', () => {
    test('classifies BBC as GREEN', () => {
      const result = classifyDomain('bbc.com', {});
      expect(result.threatLevel).toBe('GREEN');
      expect(result.riskScore).toBeLessThanOrEqual(20);
    });

    test('classifies Reuters as GREEN', () => {
      const result = classifyDomain('reuters.com', {});
      expect(result.threatLevel).toBe('GREEN');
    });

    test('classifies AP News as GREEN', () => {
      const result = classifyDomain('apnews.com', {});
      expect(result.threatLevel).toBe('GREEN');
    });

    test('classifies NYT as GREEN', () => {
      const result = classifyDomain('nytimes.com', {});
      expect(result.threatLevel).toBe('GREEN');
    });
  });

  describe('classifyDomain — Moderate Risk (YELLOW)', () => {
    test('classifies Fox News as YELLOW', () => {
      const result = classifyDomain('foxnews.com', {});
      expect(result.threatLevel).toBe('YELLOW');
      expect(result.riskScore).toBeGreaterThan(20);
      expect(result.riskScore).toBeLessThanOrEqual(55);
    });

    test('classifies HuffPost as YELLOW', () => {
      const result = classifyDomain('huffpost.com', {});
      expect(result.threatLevel).toBe('YELLOW');
    });
  });

  describe('classifyDomain — Disinformation (RED)', () => {
    test('classifies InfoWars as RED', () => {
      const result = classifyDomain('infowars.com', {});
      expect(result.threatLevel).toBe('RED');
      expect(result.riskScore).toBeGreaterThanOrEqual(76);
    });

    test('classifies RT as RED', () => {
      const result = classifyDomain('rt.com', {});
      expect(result.threatLevel).toBe('RED');
    });
  });

  describe('classifyDomain — Unknown domains with signals', () => {
    test('flags domain from high-risk country', () => {
      const result = classifyDomain('unknown-news.example', { country: 'Russia' });
      expect(result.signals).toContain(expect.stringContaining('high-risk country'));
    });

    test('flags suspicious TLDs', () => {
      const result = classifyDomain('fakenews.xyz', {});
      expect(result.signals).toContain(expect.stringContaining('Suspicious TLD'));
    });

    test('flags excessive hyphens', () => {
      const result = classifyDomain('breaking-news-daily-update-source.com', {});
      expect(result.signals).toContain(expect.stringContaining('excessive hyphens'));
    });
  });

  describe('Domain lists integrity', () => {
    test('trusted domains list is populated', () => {
      expect(TRUSTED_DOMAINS.size).toBeGreaterThan(10);
    });

    test('disinformation domains list is populated', () => {
      expect(DISINFORMATION_DOMAINS.size).toBeGreaterThan(5);
    });

    test('no domain appears in both trusted and disinformation lists', () => {
      for (const domain of TRUSTED_DOMAINS) {
        expect(DISINFORMATION_DOMAINS.has(domain)).toBe(false);
      }
    });
  });
});
