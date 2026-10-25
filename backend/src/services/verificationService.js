'use strict';

const Task = require('../models/Task');
const Issue = require('../models/Issue');
const { verifyFix } = require('./geminiService');
const { logAction } = require('./auditLogService');
const { env } = require('../config/env');
const ApiError = require('../utils/ApiError');

const runVerification = async ({ taskId, afterImagePath, afterImageUrl, workerId }) => {
  const task = await Task.findById(taskId).select('+afterImagePath');
  if (!task) throw ApiError.notFound('Task not found');
  const issue = await Issue.findById(task.issueId).select('+beforeImagePath');
  if (!issue) throw ApiError.notFound('Issue not found');
  if (!issue.beforeImagePath) throw ApiError.badRequest('No before image available for comparison');

  await logAction({ actorId: workerId, actorRole: 'Worker', action: 'VERIFICATION_STARTED', entityType: 'Task', entityId: task._id, metadata: { taskCode: task.taskCode, attemptNumber: task.attemptCount + 1 } });

  const aiResult = await verifyFix(issue.beforeImagePath, afterImagePath, { type: issue.type, description: issue.description, severity: issue.severity });

  task.afterImageUrl = afterImageUrl;
  task.afterImagePath = afterImagePath;
  task.attemptCount += 1;
  task.submittedAt = new Date();
  task.aiVerificationResult = {
    verified: aiResult.verified, confidenceScore: aiResult.confidenceScore, reason: aiResult.reason,
    beforeCondition: aiResult.beforeCondition, afterCondition: aiResult.afterCondition,
    needsHumanReview: aiResult.needsHumanReview, model: aiResult.model, verifiedAt: new Date(),
  };
  task.verificationHistory.push({ attemptNumber: task.attemptCount, afterImageUrl, afterImagePath, aiResult, submittedAt: new Date(), verifiedAt: new Date() });

  if (aiResult.needsHumanReview || aiResult.error) {
    task.status = 'AwaitingSupervisorReview';
    issue.status = 'AwaitingVerification';
  } else if (aiResult.verified && aiResult.confidenceScore >= env.AI_MIN_CONFIDENCE) {
    if (env.AI_AUTO_CLOSE_ENABLED) {
      task.status = 'Resolved'; task.completedAt = new Date();
      issue.status = 'Resolved'; issue.resolvedAt = new Date();
    } else {
      task.status = 'AwaitingSupervisorReview';
      issue.status = 'AwaitingVerification';
    }
  } else {
    task.status = 'VerificationFailed';
    issue.status = 'VerificationFailed';
  }

  await task.save();
  await issue.save();

  const logActionName = aiResult.verified ? 'VERIFICATION_COMPLETED' : 'VERIFICATION_FAILED';
  await logAction({ actorId: workerId, actorRole: 'Worker', action: logActionName, entityType: 'Task', entityId: task._id, metadata: { taskCode: task.taskCode, verified: aiResult.verified, confidenceScore: aiResult.confidenceScore, attemptNumber: task.attemptCount } });
  return { task, aiResult };
};

const approveTask = async ({ taskId, supervisorId, reason }) => {
  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound('Task not found');
  if (!['AwaitingSupervisorReview', 'VerificationFailed'].includes(task.status)) throw ApiError.badRequest(`Cannot approve task in status: ${task.status}`);

  task.status = 'Resolved';
  task.completedAt = new Date();
  task.supervisorReview = { reviewedBy: supervisorId, decision: 'Approved', reason: reason || 'Approved by supervisor', reviewedAt: new Date() };
  await task.save();

  const issue = await Issue.findById(task.issueId);
  if (issue) { issue.status = 'Resolved'; issue.resolvedAt = new Date(); await issue.save(); }

  await logAction({ actorId: supervisorId, actorRole: 'Supervisor', action: 'SUPERVISOR_APPROVED', entityType: 'Task', entityId: task._id, metadata: { taskCode: task.taskCode, reason } });
  if (issue) await logAction({ actorId: supervisorId, actorRole: 'Supervisor', action: 'ISSUE_RESOLVED', entityType: 'Issue', entityId: issue._id, metadata: { issueCode: issue.issueCode } });
  return task;
};

const rejectTask = async ({ taskId, supervisorId, reason }) => {
  const task = await Task.findById(taskId);
  if (!task) throw ApiError.notFound('Task not found');
  if (!['AwaitingSupervisorReview', 'VerificationFailed'].includes(task.status)) throw ApiError.badRequest(`Cannot reject task in status: ${task.status}`);

  task.status = 'Rejected';
  task.supervisorReview = { reviewedBy: supervisorId, decision: 'Rejected', reason: reason || 'Rejected by supervisor', reviewedAt: new Date() };
  await task.save();

  await Issue.findByIdAndUpdate(task.issueId, { status: 'Pending', assignedWorkerId: null, assignedAt: null });
  await logAction({ actorId: supervisorId, actorRole: 'Supervisor', action: 'SUPERVISOR_REJECTED', entityType: 'Task', entityId: task._id, metadata: { taskCode: task.taskCode, reason } });
  return task;
};

module.exports = { runVerification, approveTask, rejectTask };
