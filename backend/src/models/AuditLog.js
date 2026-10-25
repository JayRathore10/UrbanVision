'use strict';

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    actorRole: { type: String, enum: ['Admin', 'Supervisor', 'Worker', 'System'], default: 'System' },
    action: {
      type: String, required: [true, 'Action is required'],
      enum: [
        'ISSUE_DETECTED', 'ISSUE_ASSIGNED', 'ISSUE_REASSIGNED', 'ISSUE_STATUS_CHANGED', 'ISSUE_RESOLVED', 'ISSUE_CANCELLED',
        'TASK_CREATED', 'TASK_ACCEPTED', 'TASK_STARTED', 'TASK_SUBMITTED', 'TASK_RESUBMITTED', 'TASK_CANCELLED',
        'EVIDENCE_UPLOADED', 'VERIFICATION_STARTED', 'VERIFICATION_COMPLETED', 'VERIFICATION_FAILED',
        'SUPERVISOR_APPROVED', 'SUPERVISOR_REJECTED',
        'USER_LOGIN', 'USER_REGISTERED', 'CAMERA_INGEST', 'INSPECTION_STARTED', 'INSPECTION_COMPLETED',
      ],
    },
    entityType: { type: String, enum: ['Issue', 'Task', 'User', 'Inspection', 'Camera'], required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    previousState: { type: mongoose.Schema.Types.Mixed, default: null },
    newState: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ actorId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
