'use strict';

const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/summary', authenticate, dashboardController.getSummary);
router.get('/issues-by-type', authenticate, dashboardController.getIssuesByType);
router.get('/issues-by-status', authenticate, dashboardController.getIssuesByStatus);
router.get('/issues-by-severity', authenticate, dashboardController.getIssuesBySeverity);
router.get('/detection-trends', authenticate, dashboardController.getDetectionTrends);
router.get('/resolution-metrics', authenticate, dashboardController.getResolutionMetrics);
router.get('/worker-performance', authenticate, dashboardController.getWorkerPerformance);

module.exports = router;
