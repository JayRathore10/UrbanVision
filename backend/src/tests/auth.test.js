'use strict';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    driverInfo: { name: 'nodejs', version: process.version },
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Health Check', () => {
  it('GET /api/health should return healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });
});

describe('POST /api/auth/register', () => {
  it('should register a new worker', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Worker', email: 'worker@test.com', password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('Worker');
    expect(res.body.data.user.email).toBe('worker@test.com');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('should reject duplicate email', async () => {
    await request(app).post('/api/auth/register').send({ name: 'User1', email: 'dup@test.com', password: 'password123' });
    const res = await request(app).post('/api/auth/register').send({ name: 'User2', email: 'dup@test.com', password: 'password456' });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject short password', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'Test', email: 'short@test.com', password: '123' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({ name: 'Login Test', email: 'login@test.com', password: 'password123' });
  });

  it('should login successfully', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'login@test.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should reject wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'login@test.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('should reject nonexistent email', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'noone@test.com', password: 'password123' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('should return current user when authenticated', async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'Me Test', email: 'me@test.com', password: 'password123' });
    const token = reg.body.data.accessToken;
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('me@test.com');
  });

  it('should reject without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should reject invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });
});

describe('Role-based authorization', () => {
  it('should prevent worker from accessing supervisor routes', async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'Worker', email: 'workerauth@test.com', password: 'password123' });
    const token = reg.body.data.accessToken;
    const res = await request(app).get('/api/supervisor/workers').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('should allow supervisor to access supervisor routes', async () => {
    // Create supervisor directly in DB
    const sup = await User.create({ name: 'Supervisor', email: 'sup@test.com', passwordHash: 'password123', role: 'Supervisor' });
    const login = await request(app).post('/api/auth/login').send({ email: 'sup@test.com', password: 'password123' });
    const token = login.body.data.accessToken;
    const res = await request(app).get('/api/supervisor/workers').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
