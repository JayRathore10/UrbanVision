'use strict';

const User = require('../models/User');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, buildPaginationResponse } = require('../utils/pagination');

exports.listWorkers = asyncHandler(async (req, res) => {
  const workers = await User.find({ role: 'Worker', isActive: true }).select('name email phone employeeId createdAt lastLoginAt');
  const workerData = await Promise.all(workers.map(async (worker) => {
    const taskCounts = await Task.aggregate([
      { $match: { workerId: worker._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const counts = {};
    taskCounts.forEach(t => { counts[t._id] = t.count; });
    return { ...worker.toJSON(), taskCounts: counts, totalTasks: Object.values(counts).reduce((a, b) => a + b, 0) };
  }));
  res.json({ success: true, data: { workers: workerData } });
});

exports.getWorkerById = asyncHandler(async (req, res) => {
  const worker = await User.findById(req.params.id).select('name email phone employeeId role isActive createdAt lastLoginAt');
  if (!worker || worker.role !== 'Worker') throw ApiError.notFound('Worker not found');

  const taskCounts = await Task.aggregate([
    { $match: { workerId: worker._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({ success: true, data: { worker, taskCounts } });
});

exports.getWorkerTasks = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { workerId: req.params.id };
  if (req.query.status) filter.status = req.query.status;

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ assignedAt: -1 }).skip(skip).limit(limit).populate('issueId', 'issueCode type severity status description'),
    Task.countDocuments(filter),
  ]);

  res.json({ success: true, data: { tasks }, pagination: buildPaginationResponse(page, limit, total) });
});

exports.getPendingReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { status: { $in: ['AwaitingSupervisorReview', 'VerificationFailed'] } };

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ submittedAt: -1 }).skip(skip).limit(limit)
      .populate('workerId', 'name email').populate('issueId', 'issueCode type severity description beforeImageUrl'),
    Task.countDocuments(filter),
  ]);

  res.json({ success: true, data: { tasks }, pagination: buildPaginationResponse(page, limit, total) });
});

exports.getReviewDetail = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId)
    .populate('workerId', 'name email phone')
    .populate('assignedBy', 'name email')
    .populate('issueId');
  if (!task) throw ApiError.notFound('Task not found');

  res.json({ success: true, data: { task, verificationHistory: task.verificationHistory, aiVerificationResult: task.aiVerificationResult } });
});
