'use strict';

const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const authenticate = require('../middleware/authenticate');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { UPLOAD_DIR } = require('../config/multer');

// Serve evidence files with authentication
router.get('/:subdir/:filename', authenticate, asyncHandler(async (req, res) => {
  const { subdir, filename } = req.params;

  // Sanitize to prevent path traversal
  const safeSubdir = path.basename(subdir);
  const safeFilename = path.basename(filename);
  const filePath = path.join(UPLOAD_DIR, safeSubdir, safeFilename);

  if (!fs.existsSync(filePath)) throw ApiError.notFound('File not found');

  // Check authorization - workers can only see files related to their tasks
  // For now, any authenticated user can view evidence
  res.sendFile(filePath);
}));

module.exports = router;
