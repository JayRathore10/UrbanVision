'use strict';

const router = require('express').Router();
const supervisorController = require('../controllers/supervisorController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { uploadVideo } = require('../config/multer');
const uploadErrorHandler = require('../middleware/uploadErrorHandler');

// Supervisor listing & profile inspection
router.get('/list', authenticate, supervisorController.listSupervisors);
router.get('/:id/profile', authenticate, supervisorController.getSupervisorById);
router.get('/:id/videos', authenticate, supervisorController.getSupervisorVideos);

// Video upload for inspection
router.post(
  '/videos',
  authenticate,
  authorize('Supervisor'),
  uploadVideo.single('video'),
  uploadErrorHandler,
  supervisorController.uploadSupervisorVideo
);

// Worker management
router.get('/workers', authenticate, authorize('Supervisor'), supervisorController.listWorkers);
router.get('/workers/:id', authenticate, authorize('Supervisor'), supervisorController.getWorkerById);
router.get('/workers/:id/tasks', authenticate, authorize('Supervisor'), supervisorController.getWorkerTasks);

// Verification reviews
router.get('/reviews', authenticate, authorize('Supervisor'), supervisorController.getPendingReviews);
router.get('/reviews/:taskId', authenticate, authorize('Supervisor'), supervisorController.getReviewDetail);

module.exports = router;
