'use strict';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Task = require('../models/Task');

let mongoServer, supervisorToken, workerToken, supervisorId, workerId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create supervisor
  const sup = await User.create({ name: 'Supervisor', email: 'sup@test.com', passwordHash: 'password123', role: 'Supervisor' });
  supervisorId = sup._id;
  const loginSup = await request(app).post('/api/auth/login').send({ email: 'sup@test.com', password: 'password123' });
  supervisorToken = loginSup.body.data.accessToken;

  // Create worker
  const regWorker = await request(app).post('/api/auth/register').send({ name: 'Worker', email: 'worker@test.com', password: 'password123' });
  workerToken = regWorker.body.data.accessToken;
  workerId = regWorker.body.data.user._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Issue.deleteMany({});
  await Task.deleteMany({});
});

describe('Issue Management', () => {
  it('GET /api/issues should return empty list initially', async () => {
    const res = await request(app).get('/api/issues').set('Authorization', `Bearer ${supervisorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.issues).toHaveLength(0);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /api/issues/map should return GeoJSON FeatureCollection', async () => {
    await Issue.create({
      issueCode: 'UV-ISSUE-0001', type: 'Pothole', description: 'Test pothole',
      severity: 'High', location: { type: 'Point', coordinates: [75.8577, 22.7196] },
    });
    const res = await request(app).get('/api/issues/map').set('Authorization', `Bearer ${supervisorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.type).toBe('FeatureCollection');
    expect(res.body.features).toHaveLength(1);
    expect(res.body.features[0].geometry.coordinates).toEqual([75.8577, 22.7196]);
  });

  it('GET /api/issues should filter by status and type', async () => {
    await Issue.create({ issueCode: 'UV-T-001', type: 'Pothole', description: 'p1', severity: 'High', status: 'Pending', location: { type: 'Point', coordinates: [75.85, 22.71] } });
    await Issue.create({ issueCode: 'UV-T-002', type: 'Garbage', description: 'g1', severity: 'Low', status: 'Resolved', location: { type: 'Point', coordinates: [75.86, 22.72] } });

    const res1 = await request(app).get('/api/issues?status=Pending').set('Authorization', `Bearer ${supervisorToken}`);
    expect(res1.body.data.issues).toHaveLength(1);
    expect(res1.body.data.issues[0].type).toBe('Pothole');

    const res2 = await request(app).get('/api/issues?type=Garbage').set('Authorization', `Bearer ${supervisorToken}`);
    expect(res2.body.data.issues).toHaveLength(1);
  });

  it('GET /api/issues/:id should return issue details', async () => {
    const issue = await Issue.create({ issueCode: 'UV-D-001', type: 'Pothole', description: 'detail test', severity: 'Medium', location: { type: 'Point', coordinates: [75.85, 22.71] } });
    const res = await request(app).get(`/api/issues/${issue._id}`).set('Authorization', `Bearer ${supervisorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.issue.issueCode).toBe('UV-D-001');
  });

  it('should return 404 for non-existent issue', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/issues/${fakeId}`).set('Authorization', `Bearer ${supervisorToken}`);
    expect(res.status).toBe(404);
  });
});

describe('Task Assignment', () => {
  let issue;

  beforeEach(async () => {
    issue = await Issue.create({ issueCode: `UV-A-${Date.now()}`, type: 'Pothole', description: 'assign test', severity: 'High', status: 'Pending', location: { type: 'Point', coordinates: [75.85, 22.71] } });
  });

  it('POST /api/assign should create a task', async () => {
    const res = await request(app).post('/api/assign').set('Authorization', `Bearer ${supervisorToken}`).send({ issueId: issue._id.toString(), workerId: workerId.toString() });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.task.status).toBe('Assigned');

    // Issue status should be updated
    const updatedIssue = await Issue.findById(issue._id);
    expect(updatedIssue.status).toBe('Assigned');
  });

  it('should prevent duplicate active assignment', async () => {
    await request(app).post('/api/assign').set('Authorization', `Bearer ${supervisorToken}`).send({ issueId: issue._id.toString(), workerId: workerId.toString() });
    const res = await request(app).post('/api/assign').set('Authorization', `Bearer ${supervisorToken}`).send({ issueId: issue._id.toString(), workerId: workerId.toString() });
    expect(res.status).toBe(409);
  });

  it('should reject assignment to non-worker', async () => {
    const res = await request(app).post('/api/assign').set('Authorization', `Bearer ${supervisorToken}`).send({ issueId: issue._id.toString(), workerId: supervisorId.toString() });
    expect(res.status).toBe(400);
  });

  it('should reject worker trying to assign tasks', async () => {
    const res = await request(app).post('/api/assign').set('Authorization', `Bearer ${workerToken}`).send({ issueId: issue._id.toString(), workerId: workerId.toString() });
    expect(res.status).toBe(403);
  });
});

describe('Worker Task Workflow', () => {
  let task;

  beforeEach(async () => {
    const issue = await Issue.create({ issueCode: `UV-W-${Date.now()}`, type: 'Pothole', description: 'workflow test', severity: 'High', status: 'Pending', location: { type: 'Point', coordinates: [75.85, 22.71] } });
    const assignRes = await request(app).post('/api/assign').set('Authorization', `Bearer ${supervisorToken}`).send({ issueId: issue._id.toString(), workerId: workerId.toString() });
    task = assignRes.body.data.task;
  });

  it('GET /api/worker/tasks should list worker tasks', async () => {
    const res = await request(app).get('/api/worker/tasks').set('Authorization', `Bearer ${workerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.tasks.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/tasks/:id/accept should accept task', async () => {
    const res = await request(app).post(`/api/tasks/${task._id}/accept`).set('Authorization', `Bearer ${workerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.task.status).toBe('Accepted');
  });

  it('POST /api/tasks/:id/start should start task', async () => {
    await request(app).post(`/api/tasks/${task._id}/accept`).set('Authorization', `Bearer ${workerToken}`);
    const res = await request(app).post(`/api/tasks/${task._id}/start`).set('Authorization', `Bearer ${workerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.task.status).toBe('InProgress');
  });

  it('should prevent supervisor from accepting worker tasks', async () => {
    const res = await request(app).post(`/api/tasks/${task._id}/accept`).set('Authorization', `Bearer ${supervisorToken}`);
    expect(res.status).toBe(403);
  });
});

describe('GPS Coordinate Validation', () => {
  it('should reject invalid coordinates in issue creation', async () => {
    try {
      await Issue.create({
        issueCode: 'UV-GPS-001', type: 'Pothole', description: 'bad gps',
        location: { type: 'Point', coordinates: [999, 999] },
      });
      fail('Should have thrown validation error');
    } catch (error) {
      expect(error.name).toBe('ValidationError');
    }
  });

  it('should accept valid Indore coordinates', async () => {
    const issue = await Issue.create({
      issueCode: 'UV-GPS-002', type: 'Pothole', description: 'good gps', severity: 'Medium',
      location: { type: 'Point', coordinates: [75.8577, 22.7196] },
    });
    expect(issue.location.coordinates).toEqual([75.8577, 22.7196]);
  });
});

describe('Supervisor Review Workflow', () => {
  it('POST /api/tasks/:id/approve should resolve task and issue', async () => {
    const issue = await Issue.create({ issueCode: `UV-R-${Date.now()}`, type: 'Pothole', description: 'review test', severity: 'High', status: 'AwaitingVerification', location: { type: 'Point', coordinates: [75.85, 22.71] } });
    const task = await Task.create({ taskCode: `UV-RT-${Date.now()}`, issueId: issue._id, workerId: workerId, assignedBy: supervisorId, status: 'AwaitingSupervisorReview' });

    const res = await request(app).post(`/api/tasks/${task._id}/approve`).set('Authorization', `Bearer ${supervisorToken}`).send({ reason: 'Looks good' });
    expect(res.status).toBe(200);
    expect(res.body.data.task.status).toBe('Resolved');

    const updatedIssue = await Issue.findById(issue._id);
    expect(updatedIssue.status).toBe('Resolved');
  });

  it('POST /api/tasks/:id/reject should return issue to pending', async () => {
    const issue = await Issue.create({ issueCode: `UV-RJ-${Date.now()}`, type: 'Garbage', description: 'reject test', severity: 'Medium', status: 'AwaitingVerification', location: { type: 'Point', coordinates: [75.86, 22.72] } });
    const task = await Task.create({ taskCode: `UV-RJT-${Date.now()}`, issueId: issue._id, workerId: workerId, assignedBy: supervisorId, status: 'AwaitingSupervisorReview' });

    const res = await request(app).post(`/api/tasks/${task._id}/reject`).set('Authorization', `Bearer ${supervisorToken}`).send({ reason: 'Not properly fixed' });
    expect(res.status).toBe(200);
    expect(res.body.data.task.status).toBe('Rejected');

    const updatedIssue = await Issue.findById(issue._id);
    expect(updatedIssue.status).toBe('Pending');
  });
});

describe('Dashboard', () => {
  it('GET /api/dashboard/summary should return statistics', async () => {
    await Issue.create({ issueCode: 'UV-DS-001', type: 'Pothole', description: 'd1', severity: 'High', status: 'Pending', location: { type: 'Point', coordinates: [75.85, 22.71] } });
    const res = await request(app).get('/api/dashboard/summary').set('Authorization', `Bearer ${supervisorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalIssues).toBeGreaterThanOrEqual(1);
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
