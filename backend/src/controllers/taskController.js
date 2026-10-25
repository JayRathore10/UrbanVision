'use strict';

const { assignTask, reassignTask, cancelTask } = require('../services/taskAssignmentService');
const { approveTask, rejectTask } = require('../services/verificationService');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, buildPaginationResponse } = require('../utils/pagination');
const { getEntityHistory } = require('../services/auditLogService');

exports.assignTask = asyncHandler(async (req, res) => {
  const { issueId, workerId, priority, instructions, dueAt } = req.body;
  const task = await assignTask({ issueId, workerId, supervisorId: req.user._id, priority, instructions, dueAt });
  const populated = await Task.findById(task._id).populate('workerId', 'name email').populate('issueId', 'issueCode type severity');
  res.status(201).json({ success: true, message: 'Task assigned successfully', data: { task: populated } });
});

exports.reassignTask = asyncHandler(async (req, res) => {
  const { newWorkerId, reason } = req.body;
  const task = await reassignTask({ taskId: req.params.id, newWorkerId, supervisorId: req.user._id, reason });
  res.json({ success: true, message: 'Task reassigned successfully', data: { task } });
});

exports.cancelTask = asyncHandler(async (req, res) => {
  const { reason } = req.body; 
  const task = await cancelTask({ taskId: req.params.id, supervisorId: req.user._id, reason });
  res.json({ success: true, message: 'Task cancelled', data: { task } });
});

exports.approveTask = asyncHandler(async (req, res) => {
  const task = await approveTask({ taskId: req.params.id, supervisorId: req.user._id, reason: req.body.reason });
  res.json({ success: true, message: 'Task approved and resolved', data: { task } });
});

exports.rejectTask = asyncHandler(async (req, res) => {
  const task = await rejectTask({ taskId: req.params.id, supervisorId: req.user._id, reason: req.body.reason });
  res.json({ success: true, message: 'Task rejected', data: { task } });
});

exports.getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('workerId', 'name email phone')
    .populate('assignedBy', 'name email')
    .populate('issueId');
  if (!task) throw ApiError.notFound('Task not found');
  const history = await getEntityHistory('Task', task._id, { page: 1, limit: 20 });
  res.json({ success: true, data: { task, history: history.logs } });
});

exports.listTasks = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.workerId) filter.workerId = req.query.workerId;
  if (req.query.issueId) filter.issueId = req.query.issueId;

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ assignedAt: -1 }).skip(skip).limit(limit)
      .populate('workerId', 'name email').populate('issueId', 'issueCode type severity status'),
    Task.countDocuments(filter),
  ]);

  res.json({ success: true, data: { tasks }, pagination: buildPaginationResponse(page, limit, total) });
});
