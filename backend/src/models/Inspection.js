'use strict';

const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema(
  {
    inspectionId: { type: String, unique: true, required: true },
    vehicleId: { type: String, required: [true, 'Vehicle ID is required'], trim: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    route: { type: mongoose.Schema.Types.Mixed, default: null },
    cameraIds: { type: [String], default: [] },
    frameCount: { type: Number, default: 0 },
    processedFrameCount: { type: Number, default: 0 },
    detectedIssueCount: { type: Number, default: 0 },
    processingStatus: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Failed', 'PartiallyCompleted'], default: 'Pending' },
    errorSummary: { type: String, default: null },
  },
  { timestamps: true }
);

inspectionSchema.index({ vehicleId: 1 });
inspectionSchema.index({ processingStatus: 1 });
inspectionSchema.index({ startedAt: -1 });

inspectionSchema.pre('validate', async function () {
  if (!this.inspectionId) {
    const count = await mongoose.model('Inspection').countDocuments();
    this.inspectionId = `UV-INSP-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Inspection', inspectionSchema);
