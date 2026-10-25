'use strict';

const mongoose = require('mongoose');

const cameraSchema = new mongoose.Schema(
  {
    cameraId: { type: String, required: [true, 'Camera ID is required'], unique: true, trim: true },
    vehicleId: { type: String, required: [true, 'Vehicle ID is required'], trim: true },
    direction: { type: String, enum: ['Front', 'Left', 'Right'], required: [true, 'Camera direction is required'] },
    model: { type: String, trim: true, default: null },
    isActive: { type: Boolean, default: true },
    lastSeenAt: { type: Date, default: null },
  },
  { timestamps: true }
);

cameraSchema.index({ vehicleId: 1, direction: 1 });

module.exports = mongoose.model('Camera', cameraSchema);
