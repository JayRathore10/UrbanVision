'use strict';

const Camera = require('../models/Camera');
const Inspection = require('../models/Inspection');
const { processFrame } = require('../services/issueDetectionService');
const { logAction } = require('../services/auditLogService');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const path = require('path');

exports.ingestImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Image file is required');

  const { vehicleId, cameraId, cameraDirection, latitude, longitude, capturedAt, inspectionId, locationAccuracyMeters } = req.body;

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  if (isNaN(lat) || lat < -90 || lat > 90) throw ApiError.badRequest('Invalid latitude. Must be between -90 and 90.');
  if (isNaN(lng) || lng < -180 || lng > 180) throw ApiError.badRequest('Invalid longitude. Must be between -180 and 180.');

  // Upsert camera record
  await Camera.findOneAndUpdate(
    { cameraId },
    { cameraId, vehicleId, direction: cameraDirection, isActive: true, lastSeenAt: new Date() },
    { upsert: true, new: true }
  );

  // Update inspection if provided
  if (inspectionId) {
    await Inspection.findOneAndUpdate(
      { inspectionId },
      { $inc: { frameCount: 1 }, $addToSet: { cameraIds: cameraId }, vehicleId, processingStatus: 'Processing' },
      { upsert: true, new: true }
    );
  }

  const imageUrl = `/api/evidence/cameras/${req.file.filename}`;
  const imagePath = req.file.path;

  const results = await processFrame({
    imagePath, imageUrl, latitude: lat, longitude: lng,
    cameraId, cameraDirection, vehicleId,
    inspectionId: inspectionId || null,
    capturedAt: capturedAt ? new Date(capturedAt) : new Date(),
    locationAccuracyMeters: locationAccuracyMeters ? parseFloat(locationAccuracyMeters) : null,
  });

  // Update inspection counts
  if (inspectionId) {
    await Inspection.findOneAndUpdate(
      { inspectionId },
      { $inc: { processedFrameCount: 1, detectedIssueCount: results.detectedIssues.length } }
    );
  }

  await logAction({ action: 'CAMERA_INGEST', entityType: 'Camera', entityId: (await Camera.findOne({ cameraId }))?._id || cameraId, metadata: { vehicleId, cameraId, cameraDirection, latitude: lat, longitude: lng, detectedCount: results.detectedIssues.length, duplicateCount: results.duplicates.length } });

  res.status(201).json({
    success: true, message: `Frame processed: ${results.detectedIssues.length} new issues, ${results.duplicates.length} duplicates`,
    data: {
      detectedIssues: results.detectedIssues.map(i => ({ id: i._id, issueCode: i.issueCode, type: i.type, severity: i.severity, confidenceScore: i.confidenceScore })),
      duplicates: results.duplicates,
      errors: results.errors,
      aiResult: results.aiResult ? { imageQuality: results.aiResult.imageQuality, summary: results.aiResult.summary, model: results.aiResult.model } : null,
    },
  });
});

exports.ingestVideo = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Video file is required');

  const { vehicleId, cameraId, cameraDirection, inspectionId } = req.body;

  const videoFilename = req.file.filename;
  const videoUrl = `/api/evidence/videos/${videoFilename}`;
  const videoPath = req.file.path;
  const fileSize = req.file.size;

  // Create/update inspection
  const inspection = await Inspection.findOneAndUpdate(
    { inspectionId: inspectionId || `UV-INSP-VIDEO-${Date.now()}` },
    {
      vehicleId: vehicleId || 'VH-001',
      supervisorId: req.user._id,
      videoUrl,
      videoPath,
      videoFilename,
      fileSize,
      cameraDirection: cameraDirection || 'Front',
      processingStatus: 'Completed',
      $addToSet: { cameraIds: cameraId || 'CAM-F-001' },
      startedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  res.status(201).json({
    success: true,
    message: 'Video uploaded and linked to inspection session.',
    data: {
      inspectionId: inspection.inspectionId,
      videoFile: videoFilename,
      videoUrl,
      status: inspection.processingStatus,
      note: 'Video playback stream available at videoUrl',
    },
  });
});

exports.getInspectionStatus = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findOne({ inspectionId: req.params.inspectionId });
  if (!inspection) throw ApiError.notFound('Inspection not found');

  res.json({ success: true, data: { inspection } });
});

exports.listCameras = asyncHandler(async (req, res) => {
  const cameras = await Camera.find({ isActive: true }).sort({ lastSeenAt: -1 });
  res.json({ success: true, data: { cameras } });
});
