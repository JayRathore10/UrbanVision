'use strict';

const router = require('express').Router();
const supervisorController = require('../controllers/supervisorController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/workers', authenticate, authorize('Supervisor'), supervisorController.listWorkers);
router.get('/workers/:id', authenticate, authorize('Supervisor'), supervisorController.getWorkerById);
router.get('/workers/:id/tasks', authenticate, authorize('Supervisor'), supervisorController.getWorkerTasks);
router.get('/reviews', authenticate, authorize('Supervisor'), supervisorController.getPendingReviews);
router.get('/reviews/:taskId', authenticate, authorize('Supervisor'), supervisorController.getReviewDetail);

module.exports = router;
