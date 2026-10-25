'use strict';

const router = require('express').Router();
const workerController = require('../controllers/workerController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/tasks', authenticate, authorize('Worker'), workerController.getMyTasks);
router.get('/tasks/:id', authenticate, authorize('Worker'), workerController.getTaskDetail);
router.get('/history', authenticate, authorize('Worker'), workerController.getHistory);
router.get('/stats', authenticate, authorize('Worker'), workerController.getStats);

module.exports = router;
