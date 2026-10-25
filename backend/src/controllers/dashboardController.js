'use strict';

const Issue = require('../models/Issue');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

exports.getSummary = asyncHandler(async (req, res) => {
  const [issueStats, taskStats] = await Promise.all([
    Issue.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const issueCounts = {};
  issueStats.forEach(s => { issueCounts[s._id] = s.count; });
  const taskCounts = {};
  taskStats.forEach(s => { taskCounts[s._id] = s.count; });
  const totalIssues = Object.values(issueCounts).reduce((a, b) => a + b, 0);

  res.json({
    success: true, data: {
      totalIssues,
      pendingIssues: issueCounts.Pending || 0,
      assignedIssues: issueCounts.Assigned || 0,
      inProgressIssues: issueCounts.InProgress || 0,
      awaitingVerification: issueCounts.AwaitingVerification || 0,
      verificationFailed: issueCounts.VerificationFailed || 0,
      resolvedIssues: issueCounts.Resolved || 0,
      cancelledIssues: issueCounts.Cancelled || 0,
      rejectedIssues: issueCounts.Rejected || 0,
      totalTasks: Object.values(taskCounts).reduce((a, b) => a + b, 0),
      taskCounts,
    },
  });
});

exports.getIssuesByType = asyncHandler(async (req, res) => {
  const result = await Issue.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
  res.json({ success: true, data: { issuesByType: result } });
});

exports.getIssuesByStatus = asyncHandler(async (req, res) => {
  const result = await Issue.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
  res.json({ success: true, data: { issuesByStatus: result } });
});

exports.getIssuesBySeverity = asyncHandler(async (req, res) => {
  const result = await Issue.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
  res.json({ success: true, data: { issuesBySeverity: result } });
});

exports.getDetectionTrends = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await Issue.aggregate([
    { $match: { detectedAt: { $gte: startDate } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$detectedAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  res.json({ success: true, data: { trends: result, period: `${days} days` } });
});

exports.getResolutionMetrics = asyncHandler(async (req, res) => {
  const resolved = await Task.find({ status: 'Resolved', completedAt: { $ne: null }, assignedAt: { $ne: null } }).select('assignedAt completedAt');

  let avgResolutionMs = 0;
  if (resolved.length > 0) {
    const totalMs = resolved.reduce((sum, t) => sum + (t.completedAt - t.assignedAt), 0);
    avgResolutionMs = totalMs / resolved.length;
  }

  const avgResolutionHours = Math.round(avgResolutionMs / (1000 * 60 * 60) * 100) / 100;

  const totalResolved = resolved.length;
  const totalIssues = await Issue.countDocuments();

  res.json({
    success: true, data: {
      totalResolved,
      totalIssues,
      resolutionRate: totalIssues > 0 ? Math.round((totalResolved / totalIssues) * 100) : 0,
      averageResolutionHours: avgResolutionHours,
    },
  });
});

exports.getWorkerPerformance = asyncHandler(async (req, res) => {
  const result = await Task.aggregate([
    { $group: { _id: '$workerId', totalTasks: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } }, rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } }, avgAttempts: { $avg: '$attemptCount' } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'worker' } },
    { $unwind: '$worker' },
    { $project: { _id: 1, name: '$worker.name', email: '$worker.email', totalTasks: 1, resolved: 1, rejected: 1, avgAttempts: 1, resolutionRate: { $cond: [{ $gt: ['$totalTasks', 0] }, { $multiply: [{ $divide: ['$resolved', '$totalTasks'] }, 100] }, 0] } } },
    { $sort: { resolved: -1 } },
  ]);

  res.json({ success: true, data: { workers: result } });
});
