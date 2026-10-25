'use strict';

const ApiError = require('../utils/ApiError');
const { env } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  if (err.statusCode === 404) {
    if (env.NODE_ENV === 'development') {
      console.warn(`[UrbanVision] 404: ${req.method} ${req.originalUrl}`);
    }
  } else if (env.NODE_ENV === 'development') {
    console.error('[UrbanVision] Error:', err);
  } else {
    console.error('[UrbanVision] Error:', err.message);
  }

  if (err.name === 'CastError') error = new ApiError(400, `Invalid ${err.path}: ${err.value}`, 'CAST_ERROR');
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    error = new ApiError(409, `Duplicate value for: ${field}`, 'DUPLICATE_KEY');
  }
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    error = new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', details);
  }
  if (err.name === 'JsonWebTokenError') error = new ApiError(401, 'Invalid token', 'AUTH_ERROR');
  if (err.name === 'TokenExpiredError') error = new ApiError(401, 'Token expired', 'AUTH_ERROR');
  if (err.code === 'LIMIT_FILE_SIZE') error = new ApiError(400, 'File too large', 'FILE_SIZE_ERROR');
  if (err.code === 'LIMIT_FILE_COUNT') error = new ApiError(400, 'Too many files', 'FILE_COUNT_ERROR');
  if (err.code === 'LIMIT_UNEXPECTED_FILE') error = new ApiError(400, 'Unexpected file field', 'FILE_FIELD_ERROR');
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = new ApiError(400, 'Invalid JSON in request body', 'JSON_PARSE_ERROR');
  }

  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message || 'Internal server error',
    error: { code: error.errorCode || 'INTERNAL_ERROR', ...(error.details && { details: error.details }) },
  };
  if (env.NODE_ENV === 'development' && error.stack) response.error.stack = error.stack;
  res.status(statusCode).json(response);
};

module.exports = { errorHandler };
