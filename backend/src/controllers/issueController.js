'use strict';

const Issue = require('../models/Issue');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, buildPaginationResponse } = require('../utils/pagination');
const { logAction } = require('../services/auditLogService');
const { getEntityHistory } = require('../services/auditLogService');

exports.listIssues = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.severity) filter.severity = req.query.severity;
  if (req.query.workerId) filter.assignedWorkerId = req.query.workerId;
  if (req.query.startDate || req.query.endDate) {
    filter.detectedAt = {};
    if (req.query.startDate) filter.detectedAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.detectedAt.$lte = new Date(req.query.endDate);
  }

  // Geospatial query
  if (req.query.latitude && req.query.longitude) {
    const lat = parseFloat(req.query.latitude);
    const lng = parseFloat(req.query.longitude);
    const radius = parseFloat(req.query.radiusMeters) || 5000;
    filter.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radius,
      },
    };
  }

  const sortBy = req.query.sortBy || 'detectedAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  const [issues, total] = await Promise.all([
    Issue.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).populate('assignedWorkerId', 'name email'),
    Issue.countDocuments(filter),
  ]);

  res.json({
    success: true, message: 'Issues fetched successfully',
    data: { issues },
    pagination: buildPaginationResponse(page, limit, total),
  });
});

exports.getIssueMap = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.severity) filter.severity = req.query.severity;

  const issues = await Issue.find(filter).select('issueCode type severity status description location detectedAt cameraDirection');

  const features = issues.map(issue => ({
    type: 'Feature',
    geometry: issue.location,
    properties: {
      issueId: issue._id,
      issueCode: issue.issueCode,
      type: issue.type,
      severity: issue.severity,
      status: issue.status,
      description: issue.description,
      detectedAt: issue.detectedAt,
      cameraDirection: issue.cameraDirection,
    },
  }));

  res.json({
    type: 'FeatureCollection',
    features,
    data: { issues },
  });
});

exports.getIssueById = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id)
    .populate('assignedWorkerId', 'name email phone')
    .populate('createdBy', 'name email');
  if (!issue) throw ApiError.notFound('Issue not found');

  const history = await getEntityHistory('Issue', issue._id, { page: 1, limit: 20 });

  res.json({ success: true, data: { issue, history: history.logs } });
});

exports.updateIssue = asyncHandler(async (req, res) => {
  const allowedFields = ['severity', 'description', 'address', 'needsHumanReview'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const issue = await Issue.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!issue) throw ApiError.notFound('Issue not found');

  await logAction({ actorId: req.user._id, actorRole: req.user.role, action: 'ISSUE_STATUS_CHANGED', entityType: 'Issue', entityId: issue._id, metadata: { updates } });

  res.json({ success: true, message: 'Issue updated', data: { issue } });
});

exports.updateIssueStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const issue = await Issue.findById(req.params.id);
  if (!issue) throw ApiError.notFound('Issue not found');

  const previousStatus = issue.status;
  issue.status = status;
  if (status === 'Resolved') issue.resolvedAt = new Date();
  if (status === 'Cancelled') issue.resolvedAt = new Date();
  await issue.save();

  await logAction({ actorId: req.user._id, actorRole: req.user.role, action: 'ISSUE_STATUS_CHANGED', entityType: 'Issue', entityId: issue._id, metadata: { reason }, previousState: { status: previousStatus }, newState: { status } });

  res.json({ success: true, message: `Issue status updated to ${status}`, data: { issue } });
});
