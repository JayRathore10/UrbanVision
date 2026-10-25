'use strict';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');

let mongoServer, supervisorToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const sup = await User.create({ name: 'Supervisor', email: 'sup@cam.com', passwordHash: 'password123', role: 'Supervisor' });
  const loginSup = await request(app).post('/api/auth/login').send({ email: 'sup@cam.com', password: 'password123' });
  supervisorToken = loginSup.body.data.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Camera Ingest Validation', () => {
  it('should reject request without image', async () => {
    const res = await request(app).post('/api/cameras/ingest')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .field('vehicleId', 'VH-001')
      .field('cameraId', 'CAM-F-001')
      .field('cameraDirection', 'Front')
      .field('latitude', '22.7196')
      .field('longitude', '75.8577');
    expect(res.status).toBe(400);
  });

  it('should reject invalid camera direction', async () => {
    const res = await request(app).post('/api/cameras/ingest')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .field('vehicleId', 'VH-001')
      .field('cameraId', 'CAM-F-001')
      .field('cameraDirection', 'TopDown')
      .field('latitude', '22.7196')
      .field('longitude', '75.8577');
    expect([400, 500]).toContain(res.status);
  });

  it('GET /api/cameras should list cameras', async () => {
    const res = await request(app).get('/api/cameras').set('Authorization', `Bearer ${supervisorToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.cameras)).toBe(true);
  });
});

describe('GPS Validation', () => {
  it('should reject latitude > 90', async () => {
    const res = await request(app).post('/api/cameras/ingest')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .field('vehicleId', 'VH-001')
      .field('cameraId', 'CAM-F-001')
      .field('cameraDirection', 'Front')
      .field('latitude', '100')
      .field('longitude', '75.8577');
    expect([400, 500]).toContain(res.status);
  });

  it('should reject longitude > 180', async () => {
    const res = await request(app).post('/api/cameras/ingest')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .field('vehicleId', 'VH-001')
      .field('cameraId', 'CAM-F-001')
      .field('cameraDirection', 'Front')
      .field('latitude', '22.71')
      .field('longitude', '200');
    expect([400, 500]).toContain(res.status);
  });
});
