'use strict';

const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const cameraController = require('../controllers/cameraController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { uploadImage, uploadVideo } = require('../config/multer');
const uploadErrorHandler = require('../middleware/uploadErrorHandler');
const { env } = require('../config/env');

const aiLimiter = rateLimit({ windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.AI_RATE_LIMIT_MAX, message: { success: false, message: 'Too many AI requests, try again later.' } });

router.post('/ingest', authenticate, authorize('Supervisor'), aiLimiter,
  (req, res, next) => { req.uploadSubdir = 'cameras'; next(); },
  uploadImage.single('image'), uploadErrorHandler, cameraController.ingestImage);

router.post('/video', authenticate, authorize('Supervisor'), aiLimiter,
  uploadVideo.single('video'), uploadErrorHandler, cameraController.ingestVideo);

router.get('/inspection/:inspectionId', authenticate, cameraController.getInspectionStatus);
router.get('/', authenticate, cameraController.listCameras);

module.exports = router;
