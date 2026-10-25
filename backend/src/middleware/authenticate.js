'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { env } = require('../config/env');

const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) throw ApiError.unauthorized('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) throw ApiError.unauthorized('User not found.');
    if (!user.isActive) throw ApiError.unauthorized('Account is deactivated.');
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'TokenExpiredError') throw ApiError.unauthorized('Token expired.');
    if (error.name === 'JsonWebTokenError') throw ApiError.unauthorized('Invalid token.');
    throw ApiError.unauthorized('Authentication failed.');
  }
});

module.exports = authenticate;
