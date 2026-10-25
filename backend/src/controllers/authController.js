'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { env } = require('../config/env');
const { logAction } = require('../services/auditLogService');

/**
 * Generate a single simple JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '7d' } // 7 days simple session
  );
};

/**
 * Register User (Supervisor or Worker)
 */
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, employeeId, role, assignedArea, department } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Email already registered');

  const userRole = ['Admin', 'Supervisor', 'Worker'].includes(role) ? role : 'Worker';
  const userData = { name, email, passwordHash: password, role: userRole };
  if (phone) userData.phone = phone;
  if (employeeId) userData.employeeId = employeeId;
  if (assignedArea) userData.assignedArea = assignedArea;
  if (department) userData.department = department;

  const user = await User.create(userData);

  const token = generateToken(user);
  await logAction({
    actorId: user._id,
    actorRole: user.role,
    action: 'USER_REGISTERED',
    entityType: 'User',
    entityId: user._id,
    metadata: { email },
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: user.toJSON(),
      token,
      accessToken: token, // alias for frontend compatibility
    },
  });
});

/**
 * Login User with Email and Password
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('Invalid email or password');
  if (!user.isActive) throw ApiError.unauthorized('Account is deactivated');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user);
  await logAction({
    actorId: user._id,
    actorRole: user.role,
    action: 'USER_LOGIN',
    entityType: 'User',
    entityId: user._id,
    metadata: { email },
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      token,
      accessToken: token, // alias for frontend compatibility
    },
  });
});

/**
 * Logout
 */
exports.logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * Get Authenticated User Profile
 */
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

/**
 * Simple Token verification / check
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ApiError.unauthorized('No active session');
  }
  const token = generateToken(req.user);
  res.json({
    success: true,
    data: {
      token,
      accessToken: token,
    },
  });
});
