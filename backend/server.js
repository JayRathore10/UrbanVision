'use strict';

const app = require('./src/app');
const { connectDB } = require('./src/config/database');
const { env } = require('./src/config/env');

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(env.PORT, () => {
      console.log(`[UrbanVision] Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    const shutdown = (signal) => {
      console.log(`\n[UrbanVision] ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        const mongoose = require('mongoose');
        mongoose.connection.close(false).then(() => {
          console.log('[UrbanVision] Server closed.');
          process.exit(0);
        });
      });
      setTimeout(() => { console.error('[UrbanVision] Forced shutdown.'); process.exit(1); }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('unhandledRejection', (err) => { console.error('[UrbanVision] Unhandled Rejection:', err); shutdown('UNHANDLED_REJECTION'); });
    process.on('uncaughtException', (err) => { console.error('[UrbanVision] Uncaught Exception:', err); shutdown('UNCAUGHT_EXCEPTION'); });
  } catch (error) {
    console.error('[UrbanVision] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
