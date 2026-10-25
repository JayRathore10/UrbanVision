'use strict';

const Joi = require('joi');

const cameraIngestSchema = Joi.object({
  vehicleId: Joi.string().trim().required(),
  cameraId: Joi.string().trim().required(),
  cameraDirection: Joi.string().valid('Front','Left','Right').required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  capturedAt: Joi.date().iso().optional(),
  inspectionId: Joi.string().trim().allow(null, '').optional(),
  locationAccuracyMeters: Joi.number().min(0).optional(),
});

const videoIngestSchema = Joi.object({
  vehicleId: Joi.string().trim().required(),
  cameraId: Joi.string().trim().required(),
  cameraDirection: Joi.string().valid('Front','Left','Right').required(),
  inspectionId: Joi.string().trim().allow(null, '').optional(),
});

module.exports = { cameraIngestSchema, videoIngestSchema };
