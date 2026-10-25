'use strict';

const mongoose = require('mongoose');
const { env } = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`[UrbanVision] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('[UrbanVision] MongoDB connection error:', error.message);
    if (env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = { connectDB };
