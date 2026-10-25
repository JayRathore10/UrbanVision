'use strict';

const Joi = require('joi');

const issueQuerySchema = Joi.object({
  status: Joi.string().valid('Pending','Assigned','InProgress','AwaitingVerification','VerificationFailed','Resolved','Rejected','Cancelled').optional(),
  type: Joi.string().valid('Pothole','RoadDamage','Garbage','GarbageOverflow','SewageOverflow','BlockedDrain','Other').optional(),
  severity: Joi.string().valid('Low','Medium','High','Critical').optional(),
  workerId: Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  radiusMeters: Joi.number().min(1).max(50000).optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().valid('detectedAt','severity','status','type','createdAt').optional(),
  sortOrder: Joi.string().valid('asc','desc').optional(),
});

const updateIssueSchema = Joi.object({
  severity: Joi.string().valid('Low','Medium','High','Critical').optional(),
  description: Joi.string().max(2000).optional(),
  address: Joi.string().max(500).allow(null, '').optional(),
  needsHumanReview: Joi.boolean().optional(),
});

const issueStatusSchema = Joi.object({
  status: Joi.string().valid('Pending','Assigned','InProgress','AwaitingVerification','VerificationFailed','Resolved','Rejected','Cancelled').required(),
  reason: Joi.string().max(500).optional(),
});

module.exports = { issueQuerySchema, updateIssueSchema, issueStatusSchema };
