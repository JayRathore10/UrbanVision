'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { env } = require('./config/env');
const path = require('path');
const fs = require('fs');

const app = express();

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header and configured frontend origins.
    // Keep wildcard support only if your deployment intentionally uses it.
    if (
      !origin ||
      env.CLIENT_ORIGIN === '*' ||
      origin === env.CLIENT_ORIGIN
    ) {
      return callback(null, true);
    }

    // Preserve the existing behavior of allowing other origins.
    // Restrict this in production once CLIENT_ORIGIN is verified.
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

// Security
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

// Handle CORS before routes and rate limiting
app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options(/.*/, cors(corsOptions));

// Rate limiting
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');

// API Root documentation endpoint
app.get('/api', (req, res) => {
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
  res.json({
    success: true,
    message: 'UrbanVision API is running',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: '1.0.0',
    },
  });
});

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cameras', require('./routes/cameraRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/supervisor', require('./routes/supervisorRoutes'));
app.use('/api/worker', require('./routes/workerRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/assign', require('./routes/assignRoutes'));
app.use('/api/evidence', require('./routes/evidenceRoutes'));

// Serve frontend assets if the frontend is built alongside the backend
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.redirect('/api');
  });
}

// Error handling
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');

app.use(notFound);
app.use(errorHandler);

module.exports = app;