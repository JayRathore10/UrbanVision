'use strict';

const router = require('express').Router();
const taskController = require('../controllers/taskController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validateRequest = require('../middleware/validateRequest');
const { assignTaskSchema } = require('../validators/taskValidators');

router.post('/', authenticate, authorize('Supervisor'), validateRequest(assignTaskSchema), taskController.assignTask);

module.exports = router;
