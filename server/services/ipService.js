/**
 * @fileoverview IP Intelligence Service
 * @description Resolves domain IP addresses and fetches geolocation data
 * Implements caching with node-cache (1hr TTL) for performance
 */

const dns = require('dns').promises;
const axios = require('axios');
const NodeCache = require('node-cache');
const { extractDomain } = require('../utils/domainParser');
const { logger } = require('../utils/logger');

// Cache IP lookups for 1 hour (3600 seconds)
const ipCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

/**
 * Resolve domain to IP address using DNS lookup
 * @param {string} domain - Domain name to resolve
 * @returns {Promise<string>} Resolved IP address
 */
async function resolveIP(domain) {
  try {
    const cacheKey = `dns_${domain}`;
    const cached = ipCache.get(cacheKey);
    if (cached) {
      logger.debug(`DNS cache hit for ${domain}`);
      return cached;
    }

    const { address } = await dns.lookup(domain);
    ipCache.set(cacheKey, address);
    logger.info(`Resolved ${domain} → ${address}`);
    return address;
  } catch (error) {
    logger.error(`DNS resolution failed for ${domain}: ${error.message}`);
    return null;
  }
}

/**
 * Fetch IP geolocation and ISP information from ip-api.com
 * @param {string} ip - IP address to lookup
 * @returns {Promise<Object>} Geolocation data { ip, country, city, isp, org, asn }
 */
async function getIPGeoInfo(ip) {
  try {
    const cacheKey = `geo_${ip}`;
    const cached = ipCache.get(cacheKey);
    if (cached) {
      logger.debug(`Geo cache hit for ${ip}`);
      return cached;
    }

    const response = await axios.get(
      `http://ip-api.com/json/${ip}?fields=status,country,city,isp,org,as,query`,
      { timeout: 5000 }
    );

    if (response.data.status !== 'success') {
      throw new Error('IP API returned failure status');
    }

    const geoInfo = {
      ip: response.data.query || ip,
      country: response.data.country || 'Unknown',
      city: response.data.city || 'Unknown',
      isp: response.data.isp || 'Unknown',
      org: response.data.org || 'Unknown',
      asn: response.data.as || 'Unknown'
    };

    ipCache.set(cacheKey, geoInfo);
    logger.info(`IP Geo: ${ip} → ${geoInfo.country}, ${geoInfo.city}`);
    return geoInfo;

  } catch (error) {
    logger.error(`IP geolocation failed for ${ip}: ${error.message}`);
    return {
      ip: ip,
      country: 'Unknown',
      city: 'Unknown',
      isp: 'Unknown',
      org: 'Unknown',
      asn: 'Unknown'
    };
  }
}

/**
 * Full IP intelligence pipeline: extract domain → resolve IP → get geo info
 * @param {string} url - The URL to analyze
 * @returns {Promise<Object>} Complete IP intel { domain, ip, country, city, isp, org, asn, isHttps }
 */
async function getSourceIntel(url) {
  const domain = extractDomain(url);
  if (!domain) {
    return {
      domain: 'Unknown',
      ip: 'Unknown',
      country: 'Unknown',
      city: 'Unknown',
      isp: 'Unknown',
      org: 'Unknown',
      asn: 'Unknown',
      isHttps: false
    };
  }

  const ip = await resolveIP(domain);
  const geoInfo = ip ? await getIPGeoInfo(ip) : {
    ip: 'Unresolvable',
    country: 'Unknown',
    city: 'Unknown',
    isp: 'Unknown',
    org: 'Unknown',
    asn: 'Unknown'
  };

  return {
    domain,
    ...geoInfo,
    isHttps: url.startsWith('https://')
  };
}

module.exports = { resolveIP, getIPGeoInfo, getSourceIntel };
