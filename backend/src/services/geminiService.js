'use strict';

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const { env } = require('../config/env');
const { getMimeType } = require('../utils/imageUtils');

let genAI = null;

const getClient = () => {
  if (!genAI) {
    if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return genAI;
};

const DETECTION_PROMPT = `You are an AI road and municipal infrastructure inspector. Analyze this image captured from a municipal vehicle camera.

Identify any visible civic/municipal infrastructure issues from these categories ONLY:
- Pothole: holes or depressions in road surface
- RoadDamage: cracks, broken asphalt, damaged road surface
- Garbage: scattered waste, litter along roads
- GarbageOverflow: overflowing garbage bins or dumpsters
- SewageOverflow: visible wastewater/sewage on roads
- BlockedDrain: clogged or overflowing stormwater drains
- Other: other clearly visible infrastructure problems

For each issue found, provide type, description, severity (Low/Medium/High/Critical), confidenceScore (0-1), and evidence array.

Respond ONLY with valid JSON:
{"issues": [{"type": "Pothole", "description": "...", "severity": "High", "confidenceScore": 0.92, "evidence": ["..."]}], "imageQuality": "Good", "needsHumanReview": false, "summary": "..."}

If no issues: {"issues": [], "imageQuality": "Good", "needsHumanReview": false, "summary": "No issues detected"}
Do NOT invent GPS coordinates.`;

const VERIFICATION_PROMPT = `You are an AI verification inspector for municipal road repairs. Compare these two images:

IMAGE 1 (BEFORE): Shows the original issue
IMAGE 2 (AFTER): Shows the same location after repair

Original issue: Type: {issueType}, Description: {issueDescription}, Severity: {issueSeverity}

Evaluate whether the repair was successfully completed. Consider same location, issue addressed, repair quality, remaining problems, lighting/angle differences.

Respond ONLY with valid JSON:
{"verified": true, "confidenceScore": 0.91, "reason": "...", "beforeCondition": "...", "afterCondition": "...", "needsHumanReview": false}`;

const parseAIResponse = (text) => {
  let jsonStr = text.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) jsonStr = jsonMatch[1].trim();
  try { return JSON.parse(jsonStr); } catch (e) {
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) return JSON.parse(objectMatch[0]);
    throw new Error('Failed to parse AI response as JSON');
  }
};

const VALID_ISSUE_TYPES = ['Pothole','RoadDamage','Garbage','GarbageOverflow','SewageOverflow','BlockedDrain','Other'];
const VALID_SEVERITIES = ['Low','Medium','High','Critical'];

const validateDetectionResult = (result) => {
  if (!result || !Array.isArray(result.issues)) {
    return { issues: [], imageQuality: 'Unknown', needsHumanReview: true, summary: 'Invalid AI response' };
  }
  const validatedIssues = result.issues.filter(i => i && i.type && i.description).map(issue => ({
    type: VALID_ISSUE_TYPES.includes(issue.type) ? issue.type : 'Other',
    description: String(issue.description).substring(0, 2000),
    severity: VALID_SEVERITIES.includes(issue.severity) ? issue.severity : 'Medium',
    confidenceScore: typeof issue.confidenceScore === 'number' ? Math.min(1, Math.max(0, issue.confidenceScore)) : 0.5,
    evidence: Array.isArray(issue.evidence) ? issue.evidence.map(String).slice(0, 10) : [],
  }));
  return {
    issues: validatedIssues,
    imageQuality: result.imageQuality || 'Unknown',
    needsHumanReview: Boolean(result.needsHumanReview),
    summary: String(result.summary || '').substring(0, 500),
  };
};

const validateVerificationResult = (result) => {
  if (!result) return { verified: false, confidenceScore: 0, reason: 'Invalid AI response', needsHumanReview: true };
  return {
    verified: Boolean(result.verified),
    confidenceScore: typeof result.confidenceScore === 'number' ? Math.min(1, Math.max(0, result.confidenceScore)) : 0,
    reason: String(result.reason || 'No reason provided').substring(0, 1000),
    beforeCondition: String(result.beforeCondition || '').substring(0, 500),
    afterCondition: String(result.afterCondition || '').substring(0, 500),
    needsHumanReview: Boolean(result.needsHumanReview),
  };
};

const detectRoadIssues = async (imagePath, metadata = {}) => {
  const client = getClient();
  const base64Image = fs.readFileSync(imagePath).toString('base64');
  const mimeType = getMimeType(imagePath);
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: [{ role: 'user', parts: [{ inlineData: { mimeType, data: base64Image } }, { text: DETECTION_PROMPT }] }],
        config: { temperature: 0.1, maxOutputTokens: 2048 },
      });
      const text = response.text;
      if (!text) throw new Error('Empty response from Gemini');
      const parsed = parseAIResponse(text);
      const validated = validateDetectionResult(parsed);
      validated.issues = validated.issues.map(issue => {
        if (issue.confidenceScore < env.AI_MIN_CONFIDENCE) return { ...issue, needsHumanReview: true };
        return issue;
      });
      return { ...validated, model: env.GEMINI_MODEL, processedAt: new Date().toISOString(), metadata };
    } catch (error) {
      lastError = error;
      console.error(`[UrbanVision] Gemini detection attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  return { issues: [], imageQuality: 'Unknown', needsHumanReview: true, summary: `AI analysis failed: ${lastError?.message}`, model: env.GEMINI_MODEL, processedAt: new Date().toISOString(), error: lastError?.message, metadata };
};

const verifyFix = async (beforeImagePath, afterImagePath, issueDetails = {}) => {
  const client = getClient();
  const beforeData = fs.readFileSync(beforeImagePath).toString('base64');
  const afterData = fs.readFileSync(afterImagePath).toString('base64');
  const beforeMime = getMimeType(beforeImagePath);
  const afterMime = getMimeType(afterImagePath);
  const prompt = VERIFICATION_PROMPT.replace('{issueType}', issueDetails.type || 'Unknown').replace('{issueDescription}', issueDetails.description || 'Unknown').replace('{issueSeverity}', issueDetails.severity || 'Unknown');
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: [{ role: 'user', parts: [{ text: 'BEFORE IMAGE:' }, { inlineData: { mimeType: beforeMime, data: beforeData } }, { text: 'AFTER IMAGE:' }, { inlineData: { mimeType: afterMime, data: afterData } }, { text: prompt }] }],
        config: { temperature: 0.1, maxOutputTokens: 1024 },
      });
      const text = response.text;
      if (!text) throw new Error('Empty response from Gemini');
      const parsed = parseAIResponse(text);
      const validated = validateVerificationResult(parsed);
      return { ...validated, model: env.GEMINI_MODEL, verifiedAt: new Date().toISOString() };
    } catch (error) {
      lastError = error;
      console.error(`[UrbanVision] Gemini verification attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  return { verified: false, confidenceScore: 0, reason: `AI verification failed: ${lastError?.message}`, needsHumanReview: true, model: env.GEMINI_MODEL, verifiedAt: new Date().toISOString(), error: lastError?.message };
};

module.exports = { detectRoadIssues, verifyFix, parseAIResponse, validateDetectionResult, validateVerificationResult };
