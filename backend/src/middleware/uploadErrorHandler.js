'use strict';

const multer = require('multer');
const ApiError = require('../utils/ApiError');

const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE': return next(new ApiError(400, 'File size exceeds the allowed limit', 'FILE_SIZE_ERROR'));
      case 'LIMIT_FILE_COUNT': return next(new ApiError(400, 'Too many files uploaded', 'FILE_COUNT_ERROR'));
      case 'LIMIT_UNEXPECTED_FILE': return next(new ApiError(400, `Unexpected file field: ${err.field}`, 'FILE_FIELD_ERROR'));
      default: return next(new ApiError(400, `Upload error: ${err.message}`, 'UPLOAD_ERROR'));
    }
  }
  next(err);
};

module.exports = uploadErrorHandler;
