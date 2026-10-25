'use strict';

const Task = require('../models/Task');
const Issue = require('../models/Issue');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { logAction } = require('./auditLogService');

const VALID_ISSUE_STATUSES_FOR_ASSIGNMENT = ['Pending', 'VerificationFailed', 'Rejected'];

const assignTask = async ({ issueId, workerId, supervisorId, priority, instructions, dueAt }) => {
  const issue = await Issue.findById(issueId);
  if (!issue) throw ApiError.notFound('Issue not found');

  const existingTask = await Task.findOne({ issueId, status: { $nin: ['Resolved', 'Cancelled', 'Rejected'] } });
  if (existingTask || issue.status === 'Assigned') {
    throw ApiError.conflict('Issue already has an active task assignment', { taskCode: existingTask ? existingTask.taskCode : undefined });
  }

  if (!VALID_ISSUE_STATUSES_FOR_ASSIGNMENT.includes(issue.status)) throw ApiError.badRequest(`Issue cannot be assigned in status: ${issue.status}`);

  const worker = await User.findById(workerId);
  if (!worker) throw ApiError.notFound('Worker not found');
  if (worker.role !== 'Worker') throw ApiError.badRequest('User is not a Worker');
  if (!worker.isActive) throw ApiError.badRequest('Worker account is inactive');

  const task = await Task.create({
    issueId, workerId, assignedBy: supervisorId,
    priority: priority || (issue.severity === 'Critical' ? 'Urgent' : issue.severity === 'High' ? 'High' : 'Medium'),
    instructions: instructions || '', dueAt: dueAt || null, assignedAt: new Date(),
  });

  issue.status = 'Assigned';
  issue.assignedWorkerId = workerId;
  issue.assignedAt = new Date();
  await issue.save();

  await logAction({ actorId: supervisorId, actorRole: 'Supervisor', action: 'ISSUE_ASSIGNED', entityType: 'Issue', entityId: issue._id, metadata: { issueCode: issue.issueCode, taskCode: task.taskCode, workerId: workerId.toString() }, previousState: { status: 'Pending' }, newState: { status: 'Assigned' } });
  await logAction({ actorId: supervisorId, actorRole: 'Supervisor', action: 'TASK_CREATED', entityType: 'Task', entityId: task._id, metadata: { taskCode: task.taskCode, issueCode: issue.issueCode } });
  return task;
};

const reassignTask = async ({ taskId, newWorkerId, supervisorId, reason }) => {
  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound('Task not found');
  if (['Resolved', 'Cancelled'].includes(task.status)) throw ApiError.badRequest(`Cannot reassign task in status: ${task.status}`);

  const newWorker = await User.findById(newWorkerId);
  if (!newWorker) throw ApiError.notFound('New worker not found');
  if (newWorker.role !== 'Worker') throw ApiError.badRequest('User is not a Worker');
  if (!newWorker.isActive) throw ApiError.badRequest('Worker account is inactive');

  const previousWorkerId = task.workerId;
  task.workerId = newWorkerId;
  task.status = 'Assigned';
  task.assignedAt = new Date();
  task.acceptedAt = null;
  task.startedAt = null;
  await task.save();

  await Issue.findByIdAndUpdate(task.issueId, { assignedWorkerId: newWorkerId, status: 'Assigned' });
  await logAction({ actorId: supervisorId, actorRole: 'Supervisor', action: 'ISSUE_REASSIGNED', entityType: 'Task', entityId: task._id, metadata: { taskCode: task.taskCode, previousWorkerId: previousWorkerId.toString(), newWorkerId: newWorkerId.toString(), reason } });
  return task;
};

const cancelTask = async ({ taskId, supervisorId, reason }) => {
  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound('Task not found');
  if (['Resolved', 'Cancelled'].includes(task.status)) throw ApiError.badRequest(`Cannot cancel task in status: ${task.status}`);

  const previousStatus = task.status;
  task.status = 'Cancelled';
  task.completedAt = new Date();
  await task.save();

  await Issue.findByIdAndUpdate(task.issueId, { status: 'Pending', assignedWorkerId: null, assignedAt: null });
  await logAction({ actorId: supervisorId, actorRole: 'Supervisor', action: 'TASK_CANCELLED', entityType: 'Task', entityId: task._id, metadata: { taskCode: task.taskCode, reason }, previousState: { status: previousStatus }, newState: { status: 'Cancelled' } });
  return task;
};

module.exports = { assignTask, reassignTask, cancelTask };
