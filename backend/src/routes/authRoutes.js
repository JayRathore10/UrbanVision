'use strict';

const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const validateRequest = require('../middleware/validateRequest');
const { registerSchema, loginSchema } = require('../validators/authValidators');
const { env } = require('../config/env');

const authLimiter = rateLimit({ windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.AUTH_RATE_LIMIT_MAX, message: { success: false, message: 'Too many auth attempts, try again later.' } });

router.post('/register', authLimiter, validateRequest(registerSchema), authController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.post('/refresh', authController.refreshToken);

module.exports = router;
