'use strict';

const { validateDetectionResult, validateVerificationResult, parseAIResponse } = require('../services/geminiService');

describe('Gemini Service - Response Validation', () => {
  describe('parseAIResponse', () => {
    it('should parse valid JSON string', () => {
      const result = parseAIResponse('{"issues": [], "imageQuality": "Good"}');
      expect(result.issues).toEqual([]);
    });

    it('should parse JSON inside markdown code blocks', () => {
      const result = parseAIResponse('```json\n{"issues": [], "imageQuality": "Good"}\n```');
      expect(result.issues).toEqual([]);
    });

    it('should extract JSON from mixed text', () => {
      const result = parseAIResponse('Here is the result: {"issues": [{"type": "Pothole", "description": "test", "severity": "High", "confidenceScore": 0.9, "evidence": []}]}');
      expect(result.issues).toHaveLength(1);
    });

    it('should throw on completely invalid input', () => {
      expect(() => parseAIResponse('not json at all')).toThrow();
    });
  });

  describe('validateDetectionResult', () => {
    it('should validate correct detection result', () => {
      const result = validateDetectionResult({
        issues: [{ type: 'Pothole', description: 'A pothole', severity: 'High', confidenceScore: 0.92, evidence: ['crack'] }],
        imageQuality: 'Good', needsHumanReview: false, summary: 'Found pothole',
      });
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('Pothole');
      expect(result.issues[0].confidenceScore).toBe(0.92);
    });

    it('should handle null/undefined input', () => {
      const result = validateDetectionResult(null);
      expect(result.issues).toEqual([]);
      expect(result.needsHumanReview).toBe(true);
    });

    it('should clamp confidence scores', () => {
      const result = validateDetectionResult({
        issues: [{ type: 'Pothole', description: 'test', confidenceScore: 1.5, evidence: [] }],
      });
      expect(result.issues[0].confidenceScore).toBe(1);
    });

    it('should replace invalid issue types with Other', () => {
      const result = validateDetectionResult({
        issues: [{ type: 'InvalidType', description: 'test', evidence: [] }],
      });
      expect(result.issues[0].type).toBe('Other');
    });

    it('should filter out issues without type or description', () => {
      const result = validateDetectionResult({
        issues: [{ type: 'Pothole' }, { description: 'no type' }, { type: 'Garbage', description: 'valid' }],
      });
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('Garbage');
    });
  });

  describe('validateVerificationResult', () => {
    it('should validate correct verification result', () => {
      const result = validateVerificationResult({
        verified: true, confidenceScore: 0.91, reason: 'Fixed',
        beforeCondition: 'Broken', afterCondition: 'Repaired', needsHumanReview: false,
      });
      expect(result.verified).toBe(true);
      expect(result.confidenceScore).toBe(0.91);
    });

    it('should handle null input', () => {
      const result = validateVerificationResult(null);
      expect(result.verified).toBe(false);
      expect(result.needsHumanReview).toBe(true);
    });

    it('should clamp confidence score', () => {
      const result = validateVerificationResult({ verified: true, confidenceScore: -0.5 });
      expect(result.confidenceScore).toBe(0);
    });
  });
});
