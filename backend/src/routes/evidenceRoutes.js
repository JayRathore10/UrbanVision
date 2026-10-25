'use strict';

const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { UPLOAD_DIR } = require('../config/multer');

// Serve evidence, camera images, and videos with streaming range support
router.get('/:subdir/:filename', asyncHandler(async (req, res) => {
  const { subdir, filename } = req.params;

  // Sanitize to prevent path traversal
  const safeSubdir = path.basename(subdir);
  const safeFilename = path.basename(filename);
  const filePath = path.join(UPLOAD_DIR, safeSubdir, safeFilename);

  if (!fs.existsSync(filePath)) {
    throw ApiError.notFound('File not found');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Handle video streaming range requests
  if (range && (safeSubdir === 'videos' || safeFilename.endsWith('.mp4') || safeFilename.endsWith('.webm'))) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (isNaN(start) || start >= fileSize) {
      res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
      return;
    }

    if (isNaN(end) || end >= fileSize) {
      end = fileSize - 1;
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const contentType = safeFilename.endsWith('.webm') ? 'video/webm' : 'video/mp4';

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    });
    file.pipe(res);
  } else {
    // Send file normally with automatic mime detection
    res.sendFile(filePath);
  }
}));

module.exports = router;
