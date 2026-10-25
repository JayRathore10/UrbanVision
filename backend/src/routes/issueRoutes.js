'use strict';

const router = require('express').Router();
const issueController = require('../controllers/issueController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validateRequest = require('../middleware/validateRequest');
const { issueQuerySchema, updateIssueSchema, issueStatusSchema } = require('../validators/issueValidators');

router.get('/', authenticate, validateRequest(issueQuerySchema, 'query'), issueController.listIssues);
router.get('/map', authenticate, issueController.getIssueMap);
router.get('/:id', authenticate, issueController.getIssueById);
router.patch('/:id', authenticate, authorize('Supervisor'), validateRequest(updateIssueSchema), issueController.updateIssue);
router.patch('/:id/status', authenticate, authorize('Supervisor'), validateRequest(issueStatusSchema), issueController.updateIssueStatus);

module.exports = router;
