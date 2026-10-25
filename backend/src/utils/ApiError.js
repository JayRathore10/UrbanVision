'use strict';

class ApiError extends Error {
  constructor(statusCode, message, errorCode = 'ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
  static badRequest(message, details = null) { return new ApiError(400, message, 'BAD_REQUEST', details); }
  static unauthorized(message = 'Unauthorized') { return new ApiError(401, message, 'UNAUTHORIZED'); }
  static forbidden(message = 'Forbidden') { return new ApiError(403, message, 'FORBIDDEN'); }
  static notFound(message = 'Resource not found') { return new ApiError(404, message, 'NOT_FOUND'); }
  static conflict(message, details = null) { return new ApiError(409, message, 'CONFLICT', details); }
  static tooManyRequests(message = 'Too many requests') { return new ApiError(429, message, 'TOO_MANY_REQUESTS'); }
  static internal(message = 'Internal server error') { return new ApiError(500, message, 'INTERNAL_ERROR'); }
}

module.exports = ApiError;
