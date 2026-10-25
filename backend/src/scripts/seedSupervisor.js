'use strict';

/**
 * Seed script to create initial Supervisor account.
 * 
 * Usage:
 *   Set SEED_SUPERVISOR_EMAIL, SEED_SUPERVISOR_PASSWORD, SEED_SUPERVISOR_NAME in .env
 *   Then: npm run seed:supervisor
 */

const mongoose = require('mongoose');
const { env } = require('../config/env');
const User = require('../models/User');

const seedSupervisor = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Seed] Connected to MongoDB');

    const email = env.SEED_SUPERVISOR_EMAIL || process.argv[2];
    const password = env.SEED_SUPERVISOR_PASSWORD || process.argv[3];
    const name = env.SEED_SUPERVISOR_NAME || process.argv[4] || 'Admin Supervisor';

    if (!email || !password) {
      console.error('[Seed] Error: Provide email and password via environment variables or command arguments.');
      console.error('  Usage: SEED_SUPERVISOR_EMAIL=admin@uv.com SEED_SUPERVISOR_PASSWORD=SecurePass123 npm run seed:supervisor');
      console.error('  Or: node src/scripts/seedSupervisor.js admin@uv.com SecurePass123 "Admin Name"');
      process.exit(1);
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`[Seed] Supervisor with email ${email} already exists.`);
      process.exit(0);
    }

    const supervisor = await User.create({
      name,
      email,
      passwordHash: password,
      role: 'Supervisor',
      isActive: true,
    });

    console.log(`[Seed] Supervisor created successfully:`);
    console.log(`  Name: ${supervisor.name}`);
    console.log(`  Email: ${supervisor.email}`);
    console.log(`  Role: ${supervisor.role}`);
    console.log(`  ID: ${supervisor._id}`);
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error:', error.message);
    process.exit(1);
  }
};

seedSupervisor();
