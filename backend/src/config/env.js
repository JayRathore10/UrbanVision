'use strict';

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];

const missing = requiredVars.filter((key) => !process.env[key]);
if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
  console.error(`[UrbanVision] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const env = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/urbanvision_test',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  JWT_SECRET: process.env.JWT_SECRET || 'test-secret-do-not-use-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'test-refresh-secret',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  MAX_IMAGE_SIZE_MB: parseInt(process.env.MAX_IMAGE_SIZE_MB, 10) || 10,
  MAX_VIDEO_SIZE_MB: parseInt(process.env.MAX_VIDEO_SIZE_MB, 10) || 200,
  VIDEO_FRAME_INTERVAL_SECONDS: parseInt(process.env.VIDEO_FRAME_INTERVAL_SECONDS, 10) || 3,
  AI_MIN_CONFIDENCE: parseFloat(process.env.AI_MIN_CONFIDENCE) || 0.60,
  AI_AUTO_CLOSE_ENABLED: process.env.AI_AUTO_CLOSE_ENABLED === 'true',
  SEED_SUPERVISOR_EMAIL: process.env.SEED_SUPERVISOR_EMAIL || '',
  SEED_SUPERVISOR_PASSWORD: process.env.SEED_SUPERVISOR_PASSWORD || '',
  SEED_SUPERVISOR_NAME: process.env.SEED_SUPERVISOR_NAME || '',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 20,
  AI_RATE_LIMIT_MAX: parseInt(process.env.AI_RATE_LIMIT_MAX, 10) || 30,
};

module.exports = { env };
