'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { env } = require('./config/env');

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true, methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(rateLimit({ windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.RATE_LIMIT_MAX_REQUESTS, message: { success: false, message: 'Too many requests, please try again later.' }, standardHeaders: true, legacyHeaders: false }));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root & Favicon
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to UrbanVision Municipal Monitoring API',
    data: {
      status: 'online',
      version: '1.0.0',
      healthCheck: '/api/health',
      docs: '/api-docs',
      endpoints: {
        auth: '/api/auth',
        cameras: '/api/cameras',
        issues: '/api/issues',
        tasks: '/api/tasks',
        supervisor: '/api/supervisor',
        worker: '/api/worker',
        dashboard: '/api/dashboard',
        assign: '/api/assign',
        evidence: '/api/evidence',
      },
    },
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'UrbanVision API is running', data: { status: 'healthy', timestamp: new Date().toISOString(), environment: env.NODE_ENV, version: '1.0.0' } });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cameras', require('./routes/cameraRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/supervisor', require('./routes/supervisorRoutes'));
app.use('/api/worker', require('./routes/workerRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/assign', require('./routes/assignRoutes'));
app.use('/api/evidence', require('./routes/evidenceRoutes'));

// 404 & error handling
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');
app.use(notFound);
app.use(errorHandler);

module.exports = app;
