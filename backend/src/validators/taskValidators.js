'use strict';

const Joi = require('joi');

const assignTaskSchema = Joi.object({
  issueId: Joi.string().required(),
  workerId: Joi.string().required(),
  priority: Joi.string().valid('Low','Medium','High','Urgent').optional(),
  instructions: Joi.string().max(2000).allow('').optional(),
  dueAt: Joi.date().iso().optional(),
});

const reassignTaskSchema = Joi.object({
  newWorkerId: Joi.string().required(),
  reason: Joi.string().max(500).optional(),
});

const resolveTaskSchema = Joi.object({
  workerNotes: Joi.string().max(2000).allow('').optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
});

const reviewSchema = Joi.object({
  reason: Joi.string().max(500).allow('').optional(),
});

module.exports = { assignTaskSchema, reassignTaskSchema, resolveTaskSchema, reviewSchema };
