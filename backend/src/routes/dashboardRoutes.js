'use strict';

const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/summary', authenticate, authorize('Supervisor'), dashboardController.getSummary);
router.get('/issues-by-type', authenticate, authorize('Supervisor'), dashboardController.getIssuesByType);
router.get('/issues-by-status', authenticate, authorize('Supervisor'), dashboardController.getIssuesByStatus);
router.get('/issues-by-severity', authenticate, authorize('Supervisor'), dashboardController.getIssuesBySeverity);
router.get('/detection-trends', authenticate, authorize('Supervisor'), dashboardController.getDetectionTrends);
router.get('/resolution-metrics', authenticate, authorize('Supervisor'), dashboardController.getResolutionMetrics);
router.get('/worker-performance', authenticate, authorize('Supervisor'), dashboardController.getWorkerPerformance);

module.exports = router;
