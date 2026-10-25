'use strict';

const AuditLog = require('../models/AuditLog');

const logAction = async ({ actorId = null, actorRole = 'System', action, entityType, entityId, metadata = {}, previousState = null, newState = null }) => {
  try {
    await AuditLog.create({ actorId, actorRole, action, entityType, entityId, metadata, previousState, newState });
  } catch (error) {
    console.error('[UrbanVision] Audit log error:', error.message);
  }
};

const getEntityHistory = async (entityType, entityId, options = {}) => {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    AuditLog.find({ entityType, entityId }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('actorId', 'name email role'),
    AuditLog.countDocuments({ entityType, entityId }),
  ]);
  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
};

module.exports = { logAction, getEntityHistory };
