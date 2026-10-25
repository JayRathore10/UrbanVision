'use strict';

const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    imagePath: { type: String, required: true, select: false },
    capturedAt: { type: Date, default: Date.now },
    cameraDirection: { type: String, enum: ['Front', 'Left', 'Right', 'Unknown'], default: 'Unknown' },
    cameraId: { type: String },
    frameIndex: { type: Number },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: true }
);

const issueSchema = new mongoose.Schema(
  {
    issueCode: { type: String, unique: true, required: true },
    type: {
      type: String, required: [true, 'Issue type is required'],
      enum: ['Pothole', 'RoadDamage', 'Garbage', 'GarbageOverflow', 'SewageOverflow', 'BlockedDrain', 'Other'],
    },
    category: {
      type: String,
      default: function () {
        const map = { Pothole: 'Road', RoadDamage: 'Road', Garbage: 'Sanitation', GarbageOverflow: 'Sanitation', SewageOverflow: 'Drainage', BlockedDrain: 'Drainage', Other: 'General' };
        return map[this.type] || 'General';
      },
    },
    description: { type: String, required: [true, 'Description is required'], maxlength: [2000, 'Description cannot exceed 2000 characters'] },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'InProgress', 'AwaitingVerification', 'VerificationFailed', 'Resolved', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    confidenceScore: { type: Number, min: 0, max: 1, default: 0 },
    detectionSource: { type: String, enum: ['AI', 'Manual', 'EdgeDevice'], default: 'AI' },
    beforeImageUrl: { type: String },
    beforeImagePath: { type: String, select: false },
    afterImageUrl: { type: String, default: null },
    afterImagePath: { type: String, select: false, default: null },
    evidence: [evidenceSchema],
    location: {
      type: { type: String, enum: ['Point'], required: true, default: 'Point' },
      coordinates: {
        type: [Number], required: true,
        validate: {
          validator: function (coords) {
            if (!Array.isArray(coords) || coords.length !== 2) return false;
            const [lng, lat] = coords;
            return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
          },
          message: 'Coordinates must be [longitude, latitude] with valid ranges',
        },
      },
    },
    locationAccuracyMeters: { type: Number, min: 0, default: null },
    address: { type: String, trim: true, default: null },
    cameraId: { type: String, default: null },
    cameraDirection: { type: String, enum: ['Front', 'Left', 'Right', 'Unknown'], default: 'Unknown' },
    inspectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspection', default: null },
    detectedAt: { type: Date, default: Date.now },
    assignedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', default: null },
    duplicateCount: { type: Number, default: 1 },
    aiDetectionDetails: { type: mongoose.Schema.Types.Mixed, default: null },
    needsHumanReview: { type: Boolean, default: false },
  },
  { timestamps: true }
);

issueSchema.index({ location: '2dsphere' });
issueSchema.index({ status: 1 });
issueSchema.index({ type: 1 });
issueSchema.index({ severity: 1 });
issueSchema.index({ detectedAt: -1 });
issueSchema.index({ assignedWorkerId: 1 });
issueSchema.index({ inspectionId: 1 });
issueSchema.index({ status: 1, type: 1, severity: 1 });

issueSchema.pre('validate', async function () {
  if (!this.issueCode) {
    const count = await mongoose.model('Issue').countDocuments();
    this.issueCode = `UV-ISSUE-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Issue', issueSchema);
