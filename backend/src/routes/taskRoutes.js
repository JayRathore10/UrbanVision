'use strict';

const router = require('express').Router();
const taskController = require('../controllers/taskController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validateRequest = require('../middleware/validateRequest');
const { reassignTaskSchema, reviewSchema } = require('../validators/taskValidators');

router.get('/', authenticate, taskController.listTasks);
router.get('/:id', authenticate, taskController.getTaskById);
router.patch('/:id/reassign', authenticate, authorize('Supervisor'), validateRequest(reassignTaskSchema), taskController.reassignTask);
router.post('/:id/cancel', authenticate, authorize('Supervisor'), taskController.cancelTask);
router.post('/:id/approve', authenticate, authorize('Supervisor'), validateRequest(reviewSchema), taskController.approveTask);
router.post('/:id/reject', authenticate, authorize('Supervisor'), validateRequest(reviewSchema), taskController.rejectTask);

// Worker task actions
const { uploadImage } = require('../config/multer');
const uploadErrorHandler = require('../middleware/uploadErrorHandler');
const workerController = require('../controllers/workerController');

router.post('/:id/accept', authenticate, authorize('Worker'), workerController.acceptTask);
router.post('/:id/start', authenticate, authorize('Worker'), workerController.startTask);
router.post('/:id/resolve', authenticate, authorize('Worker'),
  (req, res, next) => { req.uploadSubdir = 'evidence'; next(); },
  uploadImage.single('image'), uploadErrorHandler, workerController.resolveTask);
router.post('/:id/resubmit', authenticate, authorize('Worker'),
  (req, res, next) => { req.uploadSubdir = 'evidence'; next(); },
  uploadImage.single('image'), uploadErrorHandler, workerController.resubmitTask);

module.exports = router;
