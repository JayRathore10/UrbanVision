'use strict';

const Task = require('../models/Task');
const Issue = require('../models/Issue');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { runVerification } = require('../services/verificationService');
const { logAction } = require('../services/auditLogService');
const { parsePagination, buildPaginationResponse } = require('../utils/pagination');

exports.getMyTasks = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { workerId: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ assignedAt: -1 }).skip(skip).limit(limit)
      .populate('issueId', 'issueCode type severity status description beforeImageUrl location address cameraDirection'),
    Task.countDocuments(filter),
  ]);

  res.json({ success: true, data: { tasks }, pagination: buildPaginationResponse(page, limit, total) });
});

exports.getTaskDetail = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, workerId: req.user._id })
    .populate('issueId', 'issueCode type severity status description beforeImageUrl location address cameraDirection category')
    .populate('assignedBy', 'name email');
  if (!task) throw ApiError.notFound('Task not found or not assigned to you');

  const permittedTransitions = getPermittedTransitions(task.status);

  res.json({ success: true, data: { task, permittedTransitions } });
});

exports.acceptTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, workerId: req.user._id });
  if (!task) throw ApiError.notFound('Task not found or not assigned to you');
  if (task.status !== 'Assigned') throw ApiError.badRequest(`Cannot accept task in status: ${task.status}`);

  task.status = 'Accepted';
  task.acceptedAt = new Date();
  await task.save();

  await Issue.findByIdAndUpdate(task.issueId, { status: 'Assigned' });
  await logAction({ actorId: req.user._id, actorRole: 'Worker', action: 'TASK_ACCEPTED', entityType: 'Task', entityId: task._id, metadata: { taskCode: task.taskCode } });

  res.json({ success: true, message: 'Task accepted', data: { task } });
});

exports.startTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, workerId: req.user._id });
  if (!task) throw ApiError.notFound('Task not found or not assigned to you');
  if (!['Accepted', 'Assigned'].includes(task.status)) throw ApiError.badRequest(`Cannot start task in status: ${task.status}`);

  task.status = 'InProgress';
  task.startedAt = new Date();
  if (!task.acceptedAt) task.acceptedAt = new Date();
  await task.save();

  await Issue.findByIdAndUpdate(task.issueId, { status: 'InProgress' });
  await logAction({ actorId: req.user._id, actorRole: 'Worker', action: 'TASK_STARTED', entityType: 'Task', entityId: task._id, metadata: { taskCode: task.taskCode } });

  res.json({ success: true, message: 'Task started', data: { task } });
});

exports.resolveTask = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('After-repair image is required');

  const task = await Task.findOne({ _id: req.params.id, workerId: req.user._id });
  if (!task) throw ApiError.notFound('Task not found or not assigned to you');
  if (!['InProgress', 'Accepted', 'Assigned', 'VerificationFailed', 'Rejected'].includes(task.status)) {
    throw ApiError.badRequest(`Cannot submit resolution in status: ${task.status}`);
  }

  const afterImageUrl = `/api/evidence/evidence/${req.file.filename}`;
  const afterImagePath = req.file.path;

  // Set worker notes and location
  if (req.body.workerNotes) task.workerNotes = req.body.workerNotes;
  if (req.body.latitude && req.body.longitude) {
    task.workerLocationAtSubmission = {
      type: 'Point',
      coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
    };
  }
  await task.save();

  await logAction({ actorId: req.user._id, actorRole: 'Worker', action: 'EVIDENCE_UPLOADED', entityType: 'Task', entityId: task._id, metadata: { taskCode: task.taskCode, afterImageUrl } });

  // Run AI verification
  const result = await runVerification({ taskId: task._id, afterImagePath, afterImageUrl, workerId: req.user._id });

  res.json({
    success: true,
    message: result.aiResult.verified ? 'Verification successful - awaiting supervisor review' : 'Verification completed - result requires review',
    data: { task: result.task, aiVerificationResult: result.aiResult },
  });
});

exports.resubmitTask = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('New after-repair image is required');

  const task = await Task.findOne({ _id: req.params.id, workerId: req.user._id });
  if (!task) throw ApiError.notFound('Task not found or not assigned to you');
  if (!['VerificationFailed', 'Rejected'].includes(task.status)) {
    throw ApiError.badRequest(`Cannot resubmit in status: ${task.status}`);
  }

  const afterImageUrl = `/api/evidence/evidence/${req.file.filename}`;
  const afterImagePath = req.file.path;

  if (req.body.workerNotes) task.workerNotes = req.body.workerNotes;
  await task.save();

  await logAction({ actorId: req.user._id, actorRole: 'Worker', action: 'TASK_RESUBMITTED', entityType: 'Task', entityId: task._id, metadata: { taskCode: task.taskCode, attemptNumber: task.attemptCount + 1 } });

  const result = await runVerification({ taskId: task._id, afterImagePath, afterImageUrl, workerId: req.user._id });

  res.json({
    success: true,
    message: 'Resubmission processed',
    data: { task: result.task, aiVerificationResult: result.aiResult },
  });
});

exports.getHistory = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { workerId: req.user._id, status: { $in: ['Resolved', 'Cancelled', 'Rejected'] } };

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ completedAt: -1 }).skip(skip).limit(limit)
      .populate('issueId', 'issueCode type severity'),
    Task.countDocuments(filter),
  ]);

  res.json({ success: true, data: { tasks }, pagination: buildPaginationResponse(page, limit, total) });
});

exports.getStats = asyncHandler(async (req, res) => {
  const stats = await Task.aggregate([
    { $match: { workerId: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const counts = {};
  stats.forEach(s => { counts[s._id] = s.count; });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  res.json({
    success: true, data: {
      totalTasks: total,
      assigned: counts.Assigned || 0,
      accepted: counts.Accepted || 0,
      inProgress: counts.InProgress || 0,
      resolved: counts.Resolved || 0,
      rejected: counts.Rejected || 0,
      cancelled: counts.Cancelled || 0,
      verificationFailed: counts.VerificationFailed || 0,
      awaitingReview: counts.AwaitingSupervisorReview || 0,
    },
  });
});

function getPermittedTransitions(status) {
  const transitions = {
    Assigned: ['Accepted'],
    Accepted: ['InProgress'],
    InProgress: ['Submitted'],
    VerificationFailed: ['Submitted'],
    Rejected: ['Submitted'],
  };
  return transitions[status] || [];
}
