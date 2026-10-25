'use strict';

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    taskCode: { type: String, unique: true, required: true },
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: [true, 'Issue ID is required'] },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Worker ID is required'] },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Assigner ID is required'] },
    status: {
      type: String,
      enum: ['Assigned', 'Accepted', 'InProgress', 'Submitted', 'VerificationPending', 'VerificationFailed', 'AwaitingSupervisorReview', 'Resolved', 'Rejected', 'Cancelled'],
      default: 'Assigned',
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    instructions: { type: String, maxlength: [2000, 'Instructions cannot exceed 2000 characters'], default: '' },
    dueAt: { type: Date, default: null },
    assignedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    afterImageUrl: { type: String, default: null },
    afterImagePath: { type: String, select: false, default: null },
    workerNotes: { type: String, maxlength: [2000, 'Notes cannot exceed 2000 characters'], default: '' },
    workerLocationAtSubmission: {
      type: { type: String, enum: ['Point'] },
      coordinates: {
        type: [Number],
        validate: {
          validator: function (coords) {
            if (!coords || coords.length === 0) return true;
            if (coords.length !== 2) return false;
            const [lng, lat] = coords;
            return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
          },
          message: 'Invalid coordinates',
        },
      },
    },
    aiVerificationResult: {
      verified: { type: Boolean, default: null },
      confidenceScore: { type: Number, min: 0, max: 1, default: null },
      reason: { type: String, default: null },
      beforeCondition: { type: String, default: null },
      afterCondition: { type: String, default: null },
      needsHumanReview: { type: Boolean, default: false },
      model: { type: String, default: null },
      verifiedAt: { type: Date, default: null },
    },
    supervisorReview: {
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      decision: { type: String, enum: ['Approved', 'Rejected', null], default: null },
      reason: { type: String, default: null },
      reviewedAt: { type: Date, default: null },
    },
    attemptCount: { type: Number, default: 0 },
    verificationHistory: [
      {
        attemptNumber: Number,
        afterImageUrl: String,
        afterImagePath: { type: String, select: false },
        aiResult: mongoose.Schema.Types.Mixed,
        submittedAt: Date,
        verifiedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

taskSchema.index({ workerId: 1 });
taskSchema.index({ issueId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ assignedAt: -1 });
taskSchema.index({ dueAt: 1 });
taskSchema.index({ workerId: 1, status: 1 });

taskSchema.pre('validate', async function () {
  if (!this.taskCode) {
    const count = await mongoose.model('Task').countDocuments();
    this.taskCode = `UV-TASK-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Task', taskSchema);
