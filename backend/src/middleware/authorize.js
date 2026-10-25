'use strict';

const ApiError = require('../utils/ApiError');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required.');
    // Admin has universal supervisory and management access
    if (req.user.role === 'Admin' || roles.includes(req.user.role)) {
      return next();
    }
    throw ApiError.forbidden(`Role '${req.user.role}' is not authorized to access this resource.`);
  };
};

module.exports = authorize;
