'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { env } = require('../config/env');
const { logAction } = require('../services/auditLogService');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, employeeId } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Email already registered');

  // All public registrations are Workers only
  const userData = { name, email, passwordHash: password, role: 'Worker' };
  if (phone) userData.phone = phone;
  if (employeeId) userData.employeeId = employeeId;
  const user = await User.create(userData);

  const tokens = generateTokens(user._id);
  await logAction({ actorId: user._id, actorRole: 'Worker', action: 'USER_REGISTERED', entityType: 'User', entityId: user._id, metadata: { email } });

  res.status(201).json({
    success: true, message: 'Registration successful',
    data: { user: user.toJSON(), ...tokens },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('Invalid email or password');
  if (!user.isActive) throw ApiError.unauthorized('Account is deactivated');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = generateTokens(user._id);
  await logAction({ actorId: user._id, actorRole: user.role, action: 'USER_LOGIN', entityType: 'User', entityId: user._id, metadata: { email } });

  res.json({
    success: true, message: 'Login successful',
    data: { user: user.toJSON(), ...tokens },
  });
});

exports.logout = asyncHandler(async (req, res) => {
  // JWT is stateless - client should discard the token
  res.json({ success: true, message: 'Logged out successfully' });
});

exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw ApiError.badRequest('Refresh token is required');

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) throw ApiError.unauthorized('Invalid refresh token');

    const tokens = generateTokens(user._id);
    res.json({ success: true, data: tokens });
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
});
