/**
 * @fileoverview Domain Parser Utility
 * @description Extracts and validates domain names from URLs
 */

/**
 * Extract the hostname (domain) from a URL string
 * @param {string} url - The URL to parse
 * @returns {string|null} The extracted domain, or null if invalid
 * @example extractDomain('https://www.bbc.com/news/article') → 'www.bbc.com'
 */
function extractDomain(url) {
  try {
    if (!url || typeof url !== 'string') return null;
    
    // Add protocol if missing
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    const parsed = new URL(normalizedUrl);
    return parsed.hostname;
  } catch {
    return null;
  }
}

/**
 * Extract the base domain (without www) from a URL
 * @param {string} url - The URL to parse
 * @returns {string|null} The base domain
 * @example getBaseDomain('https://www.bbc.com/news') → 'bbc.com'
 */
function getBaseDomain(url) {
  const hostname = extractDomain(url);
  if (!hostname) return null;
  return hostname.replace(/^www\./, '');
}

/**
 * Validate if a string is a valid URL
 * @param {string} url - The string to validate
 * @returns {boolean} True if valid URL
 */
function isValidUrl(url) {
  try {
    if (!url || typeof url !== 'string') return false;
    let normalized = url.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}

module.exports = { extractDomain, getBaseDomain, isValidUrl };
