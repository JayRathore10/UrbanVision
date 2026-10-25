'use strict';

const ApiError = require('../utils/ApiError');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required.');
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(`Role '${req.user.role}' is not authorized to access this resource.`);
    }
    next();
  };
};

module.exports = authorize;
