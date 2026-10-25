'use strict';

const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().trim().allow(null, '').optional(),
  employeeId: Joi.string().trim().allow(null, '').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
