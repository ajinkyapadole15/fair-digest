/**
 * @fileoverview Claude AI Service — Strategy Pattern Implementation
 * @description Handles communication with Anthropic's Claude API for article analysis
 * Uses claude-sonnet-4-5 model for ethical news analysis
 */

const Anthropic = require('@anthropic-ai/sdk');
const { logger } = require('../utils/logger');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * System prompt for ethical journalism AI
 * @constant {string}
 */
const SYSTEM_PROMPT = 'You are an ethical journalism AI. Analyze news articles with zero political bias. Always present multiple perspectives.';

/**
 * Analyze article text using Claude AI
 * @param {string} articleText - The full text of the article to analyze
 * @param {string} model - The model requested by the user
 * @returns {Promise<Object>} Analysis result with summary, bias, sentiment, factSignals, counterpoints
 * @throws {Error} If Claude API call fails or response is invalid
 */
async function analyzeArticle(articleText, model = 'claude-sonnet-4-5') {
  // Mock mode if API key is not configured
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    logger.warn('ANTHROPIC_API_KEY is not configured. Using mock AI analysis data.');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
    
    // Dynamic mock based on model
    
    // Extract a basic summary from the first 200 characters of the text
    const textSample = articleText ? articleText.substring(0, 300).replace(/\n/g, ' ') + '...' : 'No text provided.';
    
    if (model === 'gemini-3-flash') {
      return {
        neutralSummary: `[Gemini Mock Summary] This article primarily covers recent developments. Based on the provided text: "${textSample}". The narrative is structured to highlight key events, though it lacks deeper context in certain areas. It provides a generalized overview without significant political extrapolation.`,
        keyTakeaways: ["Highlights recent developments", "Lacks deep context", "Provides generalized overview"],
        biasScore: 5,
        biasLabel: "Center",
        sentiment: "Neutral",
        sentimentScore: 50,
        factSignals: [
          { claim: "Market shifted by 20%.", confidence: 90, checkable: true }
        ],
        counterpoints: [
          "The data might be skewed by seasonal changes."
        ],
        fakeNewsFactors: ["Vague generalizations", "Lack of primary sources"],
        sourceName: "Mock News Source",
        credibilityNotes: "Mock assessment: Source appears to have moderate reliability."
      };
    }

    const hash = (articleText.length + (articleText.charCodeAt(0) || 0)) * 17;
    const mockBiasScore = (hash % 160) - 80; // -80 to 80
    
    let mockBiasLabel = 'Center';
    if (mockBiasScore <= -60) mockBiasLabel = 'Far Left';
    else if (mockBiasScore <= -20) mockBiasLabel = 'Left';
    else if (mockBiasScore < 0) mockBiasLabel = 'Center-Left';
    else if (mockBiasScore === 0) mockBiasLabel = 'Center';
    else if (mockBiasScore < 20) mockBiasLabel = 'Center-Right';
    else if (mockBiasScore < 60) mockBiasLabel = 'Right';
    else mockBiasLabel = 'Far Right';

    const sentiments = ["Neutral", "Mixed", "Positive", "Negative"];
    const mockSentiment = sentiments[hash % 4];
    const mockSentimentScore = 40 + (hash % 45); // 40 to 85

    const dynamicFakeNewsFactors = [];
    const lowerText = (articleText || '').toLowerCase();
    
    if (lowerText.includes('shock') || lowerText.includes('miracle') || lowerText.includes('believe') || lowerText.includes('cure')) {
      dynamicFakeNewsFactors.push('Emotional Manipulation Threat');
      dynamicFakeNewsFactors.push('Sensationalism or Clickbait');
    }
    if (lowerText.includes('idiot') || lowerText.includes('stupid') || lowerText.includes('destroy') || lowerText.includes('evil')) {
      dynamicFakeNewsFactors.push('Abusive Language Threat');
    }
    if (lowerText.includes('democrat') || lowerText.includes('republican') || lowerText.includes('liberal') || lowerText.includes('conservative')) {
      dynamicFakeNewsFactors.push('Biased Content Threat');
    }
    if (lowerText.includes(' ai ') || lowerText.includes('chatgpt') || lowerText.includes('generated')) {
      dynamicFakeNewsFactors.push('AI Generated Content Detected');
    }
    if (lowerText.includes('api') || lowerText.includes('security') || lowerText.includes('hack')) {
      dynamicFakeNewsFactors.push('API & Security Threat');
    }
    if (lowerText.includes('%') || lowerText.includes('study') || lowerText.includes('research') || /\d/.test(lowerText)) {
      dynamicFakeNewsFactors.push('Misleading Statistics');
    }
    if (dynamicFakeNewsFactors.length === 0) {
       dynamicFakeNewsFactors.push('Sensationalism or Clickbait');
    }

    return {
      neutralSummary: `[Claude 4.5 Mock Summary] The provided article discusses significant events and their broader implications. Here is the core context extracted: "${textSample}". Analysts suggest that these developments could lead to major policy shifts, though the immediate impact remains to be seen. The tone of the piece presents these facts through a specific lens, requiring readers to consider alternative perspectives.`,
      keyTakeaways: ["Significant events discussed", "Potential for policy shifts", "Tone suggests specific lens"],
      biasScore: mockBiasScore,
      biasLabel: mockBiasLabel,
      sentiment: mockSentiment,
      sentimentScore: mockSentimentScore,
      factSignals: [
        { claim: "Recent events have caused a 20% shift in the market.", confidence: 85, checkable: true },
        { claim: "Experts universally agree on this policy change.", confidence: 40, checkable: true }
      ],
      counterpoints: [
        "Alternative perspectives suggest the market shift is temporary.",
        "Some analysts believe the policy change will have negative long-term effects."
      ],
      fakeNewsFactors: dynamicFakeNewsFactors,
      sourceName: "Mock News Source",
      credibilityNotes: "Mock assessment: Source appears to have moderate reliability."
    };
  }

  try {
    const userPrompt = `Analyze this news article and return a JSON object with these exact keys:
{
  "neutralSummary": "A detailed, comprehensive 3-5 paragraph factual neutral summary of the article.",
  "keyTakeaways": ["string", "string", "string"],
  "biasScore": number from -100 (far left) to 100 (far right),
  "biasLabel": "Far Left | Left | Center-Left | Center | Center-Right | Right | Far Right",
  "sentiment": "Positive | Negative | Neutral | Mixed",
  "sentimentScore": number 0-100,
  "factSignals": [ { "claim": string, "confidence": number, "checkable": boolean } ],
  "counterpoints": [ string, string, string ],
  "fakeNewsFactors": [ "string", "string" ], // Identify factors that indicate fake news or poor journalism. ONLY use the following categories if applicable: "Emotional Manipulation Threat", "Abusive Language Threat", "Biased Content Threat", "AI Generated Content Detected", "API & Security Threat", "Misleading Statistics", "Sensationalism or Clickbait". Leave empty if none.
  "sourceName": string,
  "credibilityNotes": string
}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no code blocks, no extra text.

Article text:
${articleText}`;

    logger.info('Sending article to Claude for analysis...');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    });

    const responseText = message.content[0].text.trim();
    
    // Parse JSON response — handle potential markdown wrapping
    let parsed;
    try {
      // Try direct parse first
      parsed = JSON.parse(responseText);
    } catch {
      // Try extracting JSON from markdown code block
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1].trim());
      } else {
        // Try finding JSON object in response
        const objMatch = responseText.match(/\{[\s\S]*\}/);
        if (objMatch) {
          parsed = JSON.parse(objMatch[0]);
        } else {
          throw new Error('Could not parse Claude response as JSON');
        }
      }
    }

    // Validate and normalize the response
    const result = {
      neutralSummary: parsed.neutralSummary || 'Summary unavailable.',
      keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [],
      biasScore: typeof parsed.biasScore === 'number' ? Math.max(-100, Math.min(100, parsed.biasScore)) : 0,
      biasLabel: parsed.biasLabel || 'Center',
      sentiment: parsed.sentiment || 'Neutral',
      sentimentScore: typeof parsed.sentimentScore === 'number' ? Math.max(0, Math.min(100, parsed.sentimentScore)) : 50,
      factSignals: Array.isArray(parsed.factSignals) ? parsed.factSignals.map(s => ({
        claim: s.claim || '',
        confidence: typeof s.confidence === 'number' ? s.confidence : 50,
        checkable: typeof s.checkable === 'boolean' ? s.checkable : true
      })) : [],
      counterpoints: Array.isArray(parsed.counterpoints) ? parsed.counterpoints : [],
      fakeNewsFactors: Array.isArray(parsed.fakeNewsFactors) ? parsed.fakeNewsFactors : [],
      sourceName: parsed.sourceName || 'Unknown',
      credibilityNotes: parsed.credibilityNotes || ''
    };

    logger.info('Claude analysis complete', { biasLabel: result.biasLabel, sentiment: result.sentiment });
    return result;

  } catch (error) {
    logger.error('Claude analysis failed:', error.message);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

/**
 * Assess domain credibility using Claude AI
 * @param {string} domain - The domain to assess
 * @param {Object} ipInfo - IP geolocation data
 * @returns {Promise<Object>} Credibility assessment { credibilityScore, assessment, flags }
 */
async function assessCredibility(domain, ipInfo) {
  // Mock mode if API key is not configured
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    return {
      credibilityScore: 75,
      assessment: 'Mock AI Assessment: This domain appears to be a standard news or content site.',
      flags: ['Simulated AI check completed']
    };
  }

  try {
    const prompt = `Assess the credibility of this news source domain and return a JSON object:
{
  "credibilityScore": number 0-100 (100 = most credible),
  "assessment": "brief 1-2 sentence assessment",
  "flags": ["list", "of", "concern", "flags"]
}

Domain: ${domain}
IP Location: ${ipInfo.country || 'Unknown'}, ${ipInfo.city || 'Unknown'}
ISP: ${ipInfo.isp || 'Unknown'}
Organization: ${ipInfo.org || 'Unknown'}

Return ONLY the JSON object.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 512,
      system: 'You are a media credibility analyst. Assess news source credibility based on domain reputation, hosting, and known track record.',
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text.trim();
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const objMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = objMatch ? JSON.parse(objMatch[0]) : { credibilityScore: 50, assessment: 'Unable to assess', flags: [] };
    }

    return {
      credibilityScore: parsed.credibilityScore || 50,
      assessment: parsed.assessment || 'Assessment unavailable',
      flags: parsed.flags || []
    };
  } catch (error) {
    logger.error('Credibility assessment failed:', error.message);
    return { credibilityScore: 50, assessment: 'Assessment unavailable', flags: [] };
  }
}

module.exports = { analyzeArticle, assessCredibility };
