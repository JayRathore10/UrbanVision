'use strict';

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { env } = require('./env');
const ApiError = require('../utils/ApiError');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

const dirs = ['cameras', 'evidence', 'temp', 'videos'];
dirs.forEach((dir) => {
  const dirPath = path.join(UPLOAD_DIR, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/mpeg', 'video/avi', 'video/quicktime', 'video/x-msvideo'];

const generateFilename = (file) => {
  const uniqueId = crypto.randomBytes(16).toString('hex');
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  return `${Date.now()}-${uniqueId}${ext}`;
};

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subdir = req.uploadSubdir || 'cameras';
    const dest = path.join(UPLOAD_DIR, subdir);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, generateFilename(file));
  },
});

const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `Unsupported image format: ${file.mimetype}. Allowed: ${ALLOWED_IMAGE_MIMES.join(', ')}`, 'INVALID_FILE_TYPE'), false);
  }
};

const videoFileFilter = (req, file, cb) => {
  if (ALLOWED_VIDEO_MIMES.includes(file.mimetype) || ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `Unsupported file format: ${file.mimetype}`, 'INVALID_FILE_TYPE'), false);
  }
};

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: env.MAX_IMAGE_SIZE_MB * 1024 * 1024, files: 5 },
});

const uploadVideo = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => { cb(null, path.join(UPLOAD_DIR, 'videos')); },
    filename: (req, file, cb) => { cb(null, generateFilename(file)); },
  }),
  fileFilter: videoFileFilter,
  limits: { fileSize: env.MAX_VIDEO_SIZE_MB * 1024 * 1024, files: 1 },
});

module.exports = { uploadImage, uploadVideo, UPLOAD_DIR, ALLOWED_IMAGE_MIMES, ALLOWED_VIDEO_MIMES };
