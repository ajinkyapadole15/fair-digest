/**
 * @fileoverview Web Scraper Service
 * @description Scrapes article content from URLs using axios + cheerio
 * Extracts title, body text, and meta description
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { logger } = require('../utils/logger');

/**
 * Scrape article content from a URL
 * @param {string} url - The article URL to scrape
 * @returns {Promise<Object>} Scraped content { title, text, description, url }
 * @throws {Error} If scraping fails or content is insufficient
 */
async function scrapeArticle(url) {
  try {
    logger.info(`Scraping article: ${url}`);

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      maxRedirects: 5
    });

    const $ = cheerio.load(response.data);

    // Remove unwanted elements
    $('script, style, nav, footer, header, aside, .advertisement, .ad, .social-share, .comments, iframe, noscript').remove();

    // Extract title (priority order)
    const title = 
      $('meta[property="og:title"]').attr('content') ||
      $('h1').first().text().trim() ||
      $('title').text().trim() ||
      'Untitled Article';

    // Extract description
    const description = 
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    // Extract article body text (multiple strategies)
    let text = '';

    // Strategy 1: Look for article tag
    const articleEl = $('article');
    if (articleEl.length) {
      text = articleEl.find('p').map((_, el) => $(el).text().trim()).get().join('\n\n');
    }

    // Strategy 2: Look for common content containers
    if (!text || text.length < 200) {
      const contentSelectors = [
        '[class*="article-body"]',
        '[class*="article-content"]',
        '[class*="story-body"]',
        '[class*="post-content"]',
        '[class*="entry-content"]',
        '.content',
        'main',
        '[role="main"]'
      ];

      for (const selector of contentSelectors) {
        const el = $(selector);
        if (el.length) {
          const extracted = el.find('p').map((_, p) => $(p).text().trim()).get().join('\n\n');
          if (extracted.length > text.length) {
            text = extracted;
          }
        }
      }
    }

    // Strategy 3: Fallback — all paragraph tags
    if (!text || text.length < 200) {
      text = $('p')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(p => p.length > 40) // Filter short paragraphs (likely UI text)
        .join('\n\n');
    }

    // Truncate if too long (Claude has context limits)
    if (text.length > 15000) {
      text = text.substring(0, 15000) + '\n\n[Article truncated for analysis]';
    }

    if (!text || text.length < 100) {
      throw new Error('Could not extract sufficient article content. The site may block scraping.');
    }

    logger.info(`Scraped article: "${title}" (${text.length} chars)`);

    return {
      title: title.substring(0, 200),
      text,
      description: description.substring(0, 500),
      url
    };

  } catch (error) {
    if (error.response) {
      logger.error(`Scraping failed with HTTP ${error.response.status}: ${url}`);
      throw new Error(`Failed to fetch article: HTTP ${error.response.status}`);
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Article request timed out. The site may be slow or blocking requests.');
    }
    logger.error(`Scraping error: ${error.message}`);
    throw error;
  }
}

module.exports = { scrapeArticle };
