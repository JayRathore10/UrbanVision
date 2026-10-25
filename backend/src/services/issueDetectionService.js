'use strict';

const Issue = require('../models/Issue');
const { detectRoadIssues } = require('./geminiService');
const { logAction } = require('./auditLogService');
const { checkForDuplicate } = require('./issueDeduplicationService');
const { env } = require('../config/env');

const processFrame = async ({ imagePath, imageUrl, latitude, longitude, cameraId, cameraDirection, vehicleId, inspectionId, capturedAt, locationAccuracyMeters }) => {
  const results = { detectedIssues: [], duplicates: [], errors: [], aiResult: null };
  try {
    const aiResult = await detectRoadIssues(imagePath, { cameraId, cameraDirection, vehicleId, inspectionId });
    results.aiResult = aiResult;
    if (!aiResult.issues || aiResult.issues.length === 0) return results;

    for (const detection of aiResult.issues) {
      try {
        const duplicate = await checkForDuplicate({ type: detection.type, longitude, latitude, radiusMeters: 15 });
        if (duplicate) {
          duplicate.duplicateCount = (duplicate.duplicateCount || 1) + 1;
          duplicate.evidence.push({
            imageUrl, imagePath, capturedAt: capturedAt || new Date(),
            cameraDirection: cameraDirection || 'Unknown', cameraId,
            metadata: { confidenceScore: detection.confidenceScore, severity: detection.severity },
          });
          await duplicate.save();
          results.duplicates.push({ existingIssueId: duplicate._id, issueCode: duplicate.issueCode, type: detection.type });
          continue;
        }

        const issue = await Issue.create({
          type: detection.type, description: detection.description, severity: detection.severity,
          confidenceScore: detection.confidenceScore, detectionSource: 'AI',
          beforeImageUrl: imageUrl, beforeImagePath: imagePath,
          evidence: [{ imageUrl, imagePath, capturedAt: capturedAt || new Date(), cameraDirection: cameraDirection || 'Unknown', cameraId, metadata: { confidenceScore: detection.confidenceScore } }],
          location: { type: 'Point', coordinates: [longitude, latitude] },
          locationAccuracyMeters: locationAccuracyMeters || null,
          cameraId, cameraDirection: cameraDirection || 'Unknown',
          inspectionId: inspectionId || null, detectedAt: capturedAt || new Date(),
          aiDetectionDetails: { model: aiResult.model, processedAt: aiResult.processedAt, rawEvidence: detection.evidence, imageQuality: aiResult.imageQuality },
          needsHumanReview: detection.needsHumanReview || detection.confidenceScore < env.AI_MIN_CONFIDENCE,
        });
        results.detectedIssues.push(issue);
        await logAction({ action: 'ISSUE_DETECTED', entityType: 'Issue', entityId: issue._id, metadata: { issueCode: issue.issueCode, type: issue.type, severity: issue.severity, confidenceScore: issue.confidenceScore, cameraDirection, vehicleId } });
      } catch (issueError) {
        results.errors.push({ type: detection.type, error: issueError.message });
      }
    }
  } catch (error) {
    results.errors.push({ error: error.message });
  }
  return results;
};

module.exports = { processFrame };
