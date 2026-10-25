'use strict';

/**
 * UrbanVision Comprehensive Data Seeder
 * Populates real supervisors, workers, issues, tasks, and inspection videos with Indore GPS coordinates.
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { env } = require('../config/env');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Task = require('../models/Task');
const Camera = require('../models/Camera');
const Inspection = require('../models/Inspection');
const AuditLog = require('../models/AuditLog');
const { UPLOAD_DIR } = require('../config/multer');

// Create minimal valid MP4 binary data for test playback
const createSampleMp4 = (filename) => {
  const videoDir = path.join(UPLOAD_DIR, 'videos');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  const filePath = path.join(videoDir, filename);
  // Valid minimal MP4 box structure (ftyp + moov + mdat)
  const ftyp = Buffer.from('000000206674797069736f6d0000020069736f6d69736f32617663316d703431', 'hex');
  const moov = Buffer.from('0000006c6d6f6f76000000646d76686400000000' + '00'.repeat(96), 'hex');
  const mdat = Buffer.from('000000086d646174', 'hex');
  const buffer = Buffer.concat([ftyp, moov, mdat]);
  fs.writeFileSync(filePath, buffer);
  return filePath;
};

// Create a sample SVG/PNG placeholder image
const createSampleImage = (subdir, filename, text) => {
  const dir = path.join(UPLOAD_DIR, subdir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, filename);
  const svg = `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#1e293b"/>
    <circle cx="320" cy="240" r="100" fill="#3b82f6" opacity="0.3"/>
    <text x="50%" y="45%" text-anchor="middle" fill="#f8fafc" font-size="24" font-family="sans-serif" font-weight="bold">UrbanVision Evidence</text>
    <text x="50%" y="55%" text-anchor="middle" fill="#94a3b8" font-size="16" font-family="sans-serif">${text}</text>
  </svg>`;
  fs.writeFileSync(filePath, svg);
  return filePath;
};

const seed = async () => {
  try {
    console.log('[UrbanVision Seed] Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('[UrbanVision Seed] Connected successfully.');

    // Clear existing records to ensure clean state
    await Promise.all([
      User.deleteMany({}),
      Issue.deleteMany({}),
      Task.deleteMany({}),
      Camera.deleteMany({}),
      Inspection.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('[UrbanVision Seed] Cleared old collections.');

    // Create sample files
    createSampleMp4('rajwada-cam-front.mp4');
    createSampleMp4('vijaynagar-cam-front.mp4');
    createSampleImage('cameras', 'pothole-rajwada.svg', 'Pothole on MG Road');
    createSampleImage('cameras', 'garbage-sarafa.svg', 'Garbage Overflow at Sarafa');
    createSampleImage('cameras', 'drain-palasia.svg', 'Blocked Drain at Palasia');
    createSampleImage('evidence', 'repair-proof-1.svg', 'Repaired Asphalt Proof');

    // 1. Seed Supervisors
    const supervisor1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@urbanvision.gov.in',
      passwordHash: 'Password123',
      role: 'Supervisor',
      employeeId: 'IMC-SUP-01',
      phone: '+91 98765 43210',
      assignedArea: 'Zone 1 - Central Indore / Rajwada',
      department: 'Roads & Civil Infrastructure',
      assignedVehicles: ['VH-001', 'VH-003'],
      location: { type: 'Point', coordinates: [75.8577, 22.7196] },
      isActive: true,
    });

    const supervisor2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@urbanvision.gov.in',
      passwordHash: 'Password123',
      role: 'Supervisor',
      employeeId: 'IMC-SUP-02',
      phone: '+91 98765 43222',
      assignedArea: 'Zone 2 - Eastern Indore / Vijay Nagar',
      department: 'Sanitation & Drainage Operations',
      assignedVehicles: ['VH-002'],
      location: { type: 'Point', coordinates: [75.8950, 22.7533] },
      isActive: true,
    });
    console.log('[UrbanVision Seed] Created 2 Supervisors: Rajesh Kumar & Priya Sharma.');

    // 2. Seed Workers
    const worker1 = await User.create({
      name: 'Amit Patel',
      email: 'amit@urbanvision.gov.in',
      passwordHash: 'Password123',
      role: 'Worker',
      employeeId: 'IMC-WRK-01',
      phone: '+91 91234 56781',
      assignedArea: 'Zone 1 - Central Indore',
      department: 'Pavement Maintenance Crew',
      isActive: true,
    });

    const worker2 = await User.create({
      name: 'Sunita Verma',
      email: 'sunita@urbanvision.gov.in',
      passwordHash: 'Password123',
      role: 'Worker',
      employeeId: 'IMC-WRK-02',
      phone: '+91 91234 56782',
      assignedArea: 'Zone 1 - Central Indore',
      department: 'Sanitation Response Team',
      isActive: true,
    });

    const worker3 = await User.create({
      name: 'Rahul Joshi',
      email: 'rahul@urbanvision.gov.in',
      passwordHash: 'Password123',
      role: 'Worker',
      employeeId: 'IMC-WRK-03',
      phone: '+91 91234 56783',
      assignedArea: 'Zone 2 - Vijay Nagar',
      department: 'Stormwater & Drainage Team',
      isActive: true,
    });

    const worker4 = await User.create({
      name: 'Vikram Singh',
      email: 'vikram@urbanvision.gov.in',
      passwordHash: 'Password123',
      role: 'Worker',
      employeeId: 'IMC-WRK-04',
      phone: '+91 91234 56784',
      assignedArea: 'Zone 2 - Vijay Nagar',
      department: 'Rapid Remediation Unit',
      isActive: true,
    });
    console.log('[UrbanVision Seed] Created 4 Workers.');

    // 3. Seed Cameras
    await Camera.create([
      { cameraId: 'CAM-F-001', vehicleId: 'VH-001', direction: 'Front', model: 'Hikvision 4K Edge Cam', isActive: true, lastSeenAt: new Date() },
      { cameraId: 'CAM-L-001', vehicleId: 'VH-001', direction: 'Left', model: 'Hikvision 1080p Side Cam', isActive: true, lastSeenAt: new Date() },
      { cameraId: 'CAM-R-001', vehicleId: 'VH-001', direction: 'Right', model: 'Hikvision 1080p Side Cam', isActive: true, lastSeenAt: new Date() },
      { cameraId: 'CAM-F-002', vehicleId: 'VH-002', direction: 'Front', model: 'Dahua 4K Edge Cam', isActive: true, lastSeenAt: new Date() },
    ]);
    console.log('[UrbanVision Seed] Created 4 Cameras.');

    // 4. Seed Inspection Videos (One for each Supervisor)
    const inspection1 = await Inspection.create({
      inspectionId: 'UV-INSP-0001',
      vehicleId: 'VH-001',
      supervisorId: supervisor1._id,
      title: 'Rajwada Carriageway Road Inspection — Truck 01',
      description: 'Front-facing AI camera surveillance recording pavement depressions and potholes along MG Road near Rajwada Palace.',
      videoUrl: '/api/evidence/videos/rajwada-cam-front.mp4',
      videoPath: path.join(UPLOAD_DIR, 'videos', 'rajwada-cam-front.mp4'),
      videoFilename: 'rajwada-cam-front.mp4',
      fileSize: 4200000,
      mimeType: 'video/mp4',
      duration: 185,
      cameraDirection: 'Front',
      assignedArea: 'Zone 1 - Central Indore / Rajwada',
      location: { type: 'Point', coordinates: [75.8577, 22.7196] },
      cameraIds: ['CAM-F-001', 'CAM-L-001'],
      frameCount: 360,
      processedFrameCount: 360,
      detectedIssueCount: 2,
      processingStatus: 'Completed',
      startedAt: new Date(Date.now() - 3600000 * 4),
      endedAt: new Date(Date.now() - 3600000 * 3),
    });

    const inspection2 = await Inspection.create({
      inspectionId: 'UV-INSP-0002',
      vehicleId: 'VH-002',
      supervisorId: supervisor2._id,
      title: 'Vijay Nagar Sanitation & Stormwater Monitoring — Truck 02',
      description: 'Left-facing AI camera inspection capturing roadside garbage overflow and blocked stormwater grates along AB Road corridor.',
      videoUrl: '/api/evidence/videos/vijaynagar-cam-front.mp4',
      videoPath: path.join(UPLOAD_DIR, 'videos', 'vijaynagar-cam-front.mp4'),
      videoFilename: 'vijaynagar-cam-front.mp4',
      fileSize: 5800000,
      mimeType: 'video/mp4',
      duration: 240,
      cameraDirection: 'Left',
      assignedArea: 'Zone 2 - Eastern Indore / Vijay Nagar',
      location: { type: 'Point', coordinates: [75.8950, 22.7533] },
      cameraIds: ['CAM-F-002'],
      frameCount: 480,
      processedFrameCount: 480,
      detectedIssueCount: 3,
      processingStatus: 'Completed',
      startedAt: new Date(Date.now() - 3600000 * 2),
      endedAt: new Date(Date.now() - 3600000 * 1),
    });
    console.log('[UrbanVision Seed] Created 2 Inspection Videos linked to supervisors.');

    // 5. Seed Real Civic Issues across Indore with accurate GeoJSON [lng, lat]
    const issue1 = await Issue.create({
      issueCode: 'UV-ISSUE-0001',
      type: 'Pothole',
      category: 'Road',
      description: 'Deep road depression (~40cm wide, 12cm depth) creating severe hazard on MG Road carriageway.',
      severity: 'High',
      status: 'InProgress',
      confidenceScore: 0.94,
      detectionSource: 'AI',
      beforeImageUrl: '/api/evidence/cameras/pothole-rajwada.svg',
      beforeImagePath: path.join(UPLOAD_DIR, 'cameras', 'pothole-rajwada.svg'),
      location: { type: 'Point', coordinates: [75.8577, 22.7196] }, // Rajwada Palace
      address: 'MG Road, Near Rajwada Palace, Indore',
      cameraId: 'CAM-F-001',
      cameraDirection: 'Front',
      inspectionId: inspection1._id,
      assignedWorkerId: worker1._id,
      detectedAt: new Date(Date.now() - 3600000 * 8),
      assignedAt: new Date(Date.now() - 3600000 * 6),
      aiDetectionDetails: {
        model: 'gemini-2.0-flash',
        imageQuality: 'Good',
        rawEvidence: ['Cracked asphalt edges', 'Sub-base soil exposure', 'Water collection hazard'],
      },
    });

    const issue2 = await Issue.create({
      issueCode: 'UV-ISSUE-0002',
      type: 'GarbageOverflow',
      category: 'Sanitation',
      description: 'Overfilled municipal solid waste bin with debris spilling across pedestrian walkway.',
      severity: 'Medium',
      status: 'Pending',
      confidenceScore: 0.89,
      detectionSource: 'AI',
      beforeImageUrl: '/api/evidence/cameras/garbage-sarafa.svg',
      beforeImagePath: path.join(UPLOAD_DIR, 'cameras', 'garbage-sarafa.svg'),
      location: { type: 'Point', coordinates: [75.8548, 22.7176] }, // Sarafa Bazaar
      address: 'Sarafa Bazaar Market Corridor, Indore',
      cameraId: 'CAM-L-001',
      cameraDirection: 'Left',
      inspectionId: inspection1._id,
      detectedAt: new Date(Date.now() - 3600000 * 7),
      aiDetectionDetails: {
        model: 'gemini-2.0-flash',
        imageQuality: 'Good',
        rawEvidence: ['Debris outside container', 'Blocked walkway'],
      },
    });

    const issue3 = await Issue.create({
      issueCode: 'UV-ISSUE-0003',
      type: 'BlockedDrain',
      category: 'Drainage',
      description: 'Stormwater drainage inlet blocked with plastic silt causing localized water backflow onto roadway.',
      severity: 'Critical',
      status: 'InProgress',
      confidenceScore: 0.91,
      detectionSource: 'AI',
      beforeImageUrl: '/api/evidence/cameras/drain-palasia.svg',
      beforeImagePath: path.join(UPLOAD_DIR, 'cameras', 'drain-palasia.svg'),
      location: { type: 'Point', coordinates: [75.8888, 22.7244] }, // Palasia Square
      address: 'Palasia Square, AB Road Intersection, Indore',
      cameraId: 'CAM-F-002',
      cameraDirection: 'Front',
      inspectionId: inspection2._id,
      assignedWorkerId: worker3._id,
      detectedAt: new Date(Date.now() - 3600000 * 5),
      assignedAt: new Date(Date.now() - 3600000 * 3),
      aiDetectionDetails: {
        model: 'gemini-2.0-flash',
        imageQuality: 'Good',
        rawEvidence: ['Storm drain grate clogged', 'Visible standing wastewater'],
      },
    });

    const issue4 = await Issue.create({
      issueCode: 'UV-ISSUE-0004',
      type: 'RoadDamage',
      category: 'Road',
      description: 'Extensive alligator cracking along the central bus rapid transit corridor.',
      severity: 'High',
      status: 'Pending',
      confidenceScore: 0.87,
      detectionSource: 'AI',
      beforeImageUrl: '/api/evidence/cameras/pothole-rajwada.svg',
      beforeImagePath: path.join(UPLOAD_DIR, 'cameras', 'pothole-rajwada.svg'),
      location: { type: 'Point', coordinates: [75.8950, 22.7533] }, // Vijay Nagar Square
      address: 'Near Vijay Nagar Square, Scheme 54, Indore',
      cameraId: 'CAM-F-002',
      cameraDirection: 'Front',
      inspectionId: inspection2._id,
      detectedAt: new Date(Date.now() - 3600000 * 4),
    });

    const issue5 = await Issue.create({
      issueCode: 'UV-ISSUE-0005',
      type: 'SewageOverflow',
      category: 'Drainage',
      description: 'Manhole overflow discharging wastewater onto commercial food street pavement.',
      severity: 'Critical',
      status: 'AwaitingVerification',
      confidenceScore: 0.93,
      detectionSource: 'AI',
      beforeImageUrl: '/api/evidence/cameras/drain-palasia.svg',
      beforeImagePath: path.join(UPLOAD_DIR, 'cameras', 'drain-palasia.svg'),
      location: { type: 'Point', coordinates: [75.8770, 22.7230] }, // Chhappan Dukan
      address: '56 Dukan (Chhappan Dukan), New Palasia, Indore',
      cameraId: 'CAM-F-001',
      cameraDirection: 'Front',
      assignedWorkerId: worker4._id,
      detectedAt: new Date(Date.now() - 3600000 * 9),
      assignedAt: new Date(Date.now() - 3600000 * 5),
    });

    const issue6 = await Issue.create({
      issueCode: 'UV-ISSUE-0006',
      type: 'Pothole',
      category: 'Road',
      description: 'Secondary road pothole filled and compacted with hot asphalt mix.',
      severity: 'Low',
      status: 'Resolved',
      confidenceScore: 0.88,
      detectionSource: 'AI',
      beforeImageUrl: '/api/evidence/cameras/pothole-rajwada.svg',
      beforeImagePath: path.join(UPLOAD_DIR, 'cameras', 'pothole-rajwada.svg'),
      location: { type: 'Point', coordinates: [75.8670, 22.6900] }, // Bhanwar Kuan
      address: 'Bhanwar Kuan Main Junction, Indore',
      assignedWorkerId: worker1._id,
      detectedAt: new Date(Date.now() - 86400000 * 2),
      assignedAt: new Date(Date.now() - 86400000 * 1),
      resolvedAt: new Date(),
    });

    const issue7 = await Issue.create({
      issueCode: 'UV-ISSUE-0007',
      type: 'Garbage',
      category: 'Sanitation',
      description: 'Scattered industrial packaging and plastic accumulation beside storm drain curb.',
      severity: 'Medium',
      status: 'Pending',
      confidenceScore: 0.82,
      detectionSource: 'AI',
      beforeImageUrl: '/api/evidence/cameras/garbage-sarafa.svg',
      beforeImagePath: path.join(UPLOAD_DIR, 'cameras', 'garbage-sarafa.svg'),
      location: { type: 'Point', coordinates: [75.8710, 22.7310] }, // Malwa Mill
      address: 'Malwa Mill Road, Industrial Area, Indore',
      detectedAt: new Date(Date.now() - 3600000 * 3),
    });

    const issue8 = await Issue.create({
      issueCode: 'UV-ISSUE-0008',
      type: 'BlockedDrain',
      category: 'Drainage',
      description: 'Concrete culvert inlet silted up with tree foliage and debris.',
      severity: 'High',
      status: 'Assigned',
      confidenceScore: 0.90,
      detectionSource: 'AI',
      beforeImageUrl: '/api/evidence/cameras/drain-palasia.svg',
      beforeImagePath: path.join(UPLOAD_DIR, 'cameras', 'drain-palasia.svg'),
      location: { type: 'Point', coordinates: [75.9120, 22.7180] }, // Bengali Square
      address: 'Near Bengali Square Flyover, Ring Road, Indore',
      assignedWorkerId: worker2._id,
      detectedAt: new Date(Date.now() - 3600000 * 6),
      assignedAt: new Date(Date.now() - 3600000 * 2),
    });
    console.log('[UrbanVision Seed] Created 8 GeoJSON Issues around Indore.');

    // 6. Seed Tasks (Assigned by exact supervisors)
    // Task 1: Rajesh Kumar assigned Amit Patel
    await Task.create({
      taskCode: 'UV-TASK-0001',
      issueId: issue1._id,
      workerId: worker1._id,
      assignedBy: supervisor1._id,
      status: 'InProgress',
      priority: 'High',
      instructions: 'Deploy cold asphalt patch and compact thoroughly. Maintain traffic cones during repair.',
      assignedAt: new Date(Date.now() - 3600000 * 6),
      acceptedAt: new Date(Date.now() - 3600000 * 5),
      startedAt: new Date(Date.now() - 3600000 * 2),
    });

    // Task 2: Rajesh Kumar assigned Sunita Verma
    await Task.create({
      taskCode: 'UV-TASK-0002',
      issueId: issue8._id,
      workerId: worker2._id,
      assignedBy: supervisor1._id,
      status: 'Assigned',
      priority: 'High',
      instructions: 'Clear culvert foliage and unblock drain waterflow before evening commute.',
      assignedAt: new Date(Date.now() - 3600000 * 2),
    });

    // Task 3: Priya Sharma assigned Rahul Joshi
    await Task.create({
      taskCode: 'UV-TASK-0003',
      issueId: issue3._id,
      workerId: worker3._id,
      assignedBy: supervisor2._id,
      status: 'InProgress',
      priority: 'Urgent',
      instructions: 'High-priority drainage unblock. Clear plastic silt and verify water discharge.',
      assignedAt: new Date(Date.now() - 3600000 * 3),
      acceptedAt: new Date(Date.now() - 3600000 * 2),
      startedAt: new Date(Date.now() - 3600000 * 1),
    });

    // Task 4: Priya Sharma assigned Vikram Singh (Awaiting Verification)
    await Task.create({
      taskCode: 'UV-TASK-0004',
      issueId: issue5._id,
      workerId: worker4._id,
      assignedBy: supervisor2._id,
      status: 'AwaitingSupervisorReview',
      priority: 'Urgent',
      instructions: 'Emergency sewage jetting and sanitization of pedestrian corridor.',
      assignedAt: new Date(Date.now() - 3600000 * 5),
      acceptedAt: new Date(Date.now() - 3600000 * 4),
      startedAt: new Date(Date.now() - 3600000 * 3),
      submittedAt: new Date(Date.now() - 3600000 * 1),
      afterImageUrl: '/api/evidence/evidence/repair-proof-1.svg',
      afterImagePath: path.join(UPLOAD_DIR, 'evidence', 'repair-proof-1.svg'),
      workerNotes: 'Manhole jetted with high-pressure water, disinfected with lime powder. Flow restored.',
      attemptCount: 1,
      aiVerificationResult: {
        verified: true,
        confidenceScore: 0.92,
        reason: 'Manhole discharge stopped. Pavement surface cleaned and disinfected.',
        beforeCondition: 'Active sewage spilling onto street',
        afterCondition: 'Clean, dry pavement with no standing wastewater',
        needsHumanReview: false,
        model: 'gemini-2.0-flash',
        verifiedAt: new Date(Date.now() - 3600000 * 1),
      },
    });

    // Task 5: Rajesh Kumar assigned Amit Patel (Resolved)
    await Task.create({
      taskCode: 'UV-TASK-0005',
      issueId: issue6._id,
      workerId: worker1._id,
      assignedBy: supervisor1._id,
      status: 'Resolved',
      priority: 'Low',
      instructions: 'Fill small road depression.',
      assignedAt: new Date(Date.now() - 86400000 * 1),
      acceptedAt: new Date(Date.now() - 86400000 * 1),
      startedAt: new Date(Date.now() - 3600000 * 12),
      submittedAt: new Date(Date.now() - 3600000 * 8),
      completedAt: new Date(),
      afterImageUrl: '/api/evidence/evidence/repair-proof-1.svg',
      supervisorReview: {
        reviewedBy: supervisor1._id,
        decision: 'Approved',
        reason: 'Asphalt surface level and well-compacted. Job closed.',
        reviewedAt: new Date(),
      },
    });
    console.log('[UrbanVision Seed] Created 5 Tasks correctly linked to supervisors & workers.');

    // 7. Seed Audit Logs
    await AuditLog.create([
      {
        actorId: supervisor1._id,
        actorRole: 'Supervisor',
        action: 'TASK_CREATED',
        entityType: 'Task',
        entityId: issue1._id,
        metadata: { supervisor: supervisor1.name, task: 'UV-TASK-0001' },
      },
      {
        actorId: supervisor2._id,
        actorRole: 'Supervisor',
        action: 'TASK_CREATED',
        entityType: 'Task',
        entityId: issue3._id,
        metadata: { supervisor: supervisor2.name, task: 'UV-TASK-0003' },
      },
      {
        actorId: supervisor2._id,
        actorRole: 'Supervisor',
        action: 'INSPECTION_STARTED',
        entityType: 'Inspection',
        entityId: inspection2._id,
        metadata: { title: inspection2.title, vehicleId: 'VH-002' },
      },
    ]);
    console.log('[UrbanVision Seed] Created Audit Logs.');

    console.log('\n=============================================');
    console.log('✅ UrbanVision Database Seed Completed Successfully!');
    console.log('=============================================');
    console.log('Supervisors:');
    console.log('  1. Rajesh Kumar: rajesh@urbanvision.gov.in / Password123 (Zone 1 - Rajwada)');
    console.log('  2. Priya Sharma: priya@urbanvision.gov.in / Password123 (Zone 2 - Vijay Nagar)');
    console.log('Workers:');
    console.log('  - Amit Patel: amit@urbanvision.gov.in / Password123');
    console.log('  - Sunita Verma: sunita@urbanvision.gov.in / Password123');
    console.log('  - Rahul Joshi: rahul@urbanvision.gov.in / Password123');
    console.log('  - Vikram Singh: vikram@urbanvision.gov.in / Password123');
    console.log('=============================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[UrbanVision Seed Error]:', error);
    process.exit(1);
  }
};

seed();
