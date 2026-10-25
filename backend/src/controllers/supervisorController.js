'use strict';

const User = require('../models/User');
const Task = require('../models/Task');
const Inspection = require('../models/Inspection');
const AuditLog = require('../models/AuditLog');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, buildPaginationResponse } = require('../utils/pagination');
const { logAction } = require('../services/auditLogService');

/**
 * List all supervisors with aggregated workloads, areas, and video counts
 */
exports.listSupervisors = asyncHandler(async (req, res) => {
  const supervisors = await User.find({ role: 'Supervisor', isActive: true })
    .select('name email phone employeeId assignedArea department assignedVehicles location createdAt lastLoginAt');

  const supervisorData = await Promise.all(
    supervisors.map(async (sup) => {
      const [assignedTasksCount, activeTasksCount, videosCount] = await Promise.all([
        Task.countDocuments({ assignedBy: sup._id }),
        Task.countDocuments({
          assignedBy: sup._id,
          status: { $nin: ['Resolved', 'Cancelled', 'Rejected'] },
        }),
        Inspection.countDocuments({ supervisorId: sup._id, videoUrl: { $ne: null } }),
      ]);

      const doc = sup.toJSON();
      return {
        ...doc,
        assignedTasksCount,
        activeTasksCount,
        videosCount,
      };
    })
  );

  res.json({ success: true, data: { supervisors: supervisorData } });
});

/**
 * Get detailed profile for exact supervisor by ID
 * Includes profile, assigned tasks, workers, videos, and activity log
 */
exports.getSupervisorById = asyncHandler(async (req, res) => {
  const supervisor = await User.findOne({ _id: req.params.id, role: 'Supervisor' })
    .select('name email phone employeeId assignedArea department assignedVehicles location createdAt lastLoginAt');

  if (!supervisor) {
    throw ApiError.notFound('Supervisor not found');
  }

  // Load EXACT records associated with THIS supervisor
  const [tasks, workers, videos, activityLogs] = await Promise.all([
    Task.find({ assignedBy: supervisor._id })
      .sort({ assignedAt: -1 })
      .populate('workerId', 'name email phone employeeId')
      .populate('issueId', 'issueCode type severity status description location address'),
    User.find({ role: 'Worker', isActive: true })
      .select('name email phone employeeId assignedArea'),
    Inspection.find({ supervisorId: supervisor._id, videoUrl: { $ne: null } })
      .sort({ startedAt: -1 }),
    AuditLog.find({ actorId: supervisor._id })
      .sort({ createdAt: -1 })
      .limit(20),
  ]);

  const activeTasks = tasks.filter((t) => !['Resolved', 'Cancelled', 'Rejected'].includes(t.status));
  const resolvedTasks = tasks.filter((t) => t.status === 'Resolved');

  res.json({
    success: true,
    data: {
      supervisor: {
        ...supervisor.toJSON(),
        stats: {
          totalTasks: tasks.length,
          activeTasks: activeTasks.length,
          resolvedTasks: resolvedTasks.length,
          totalVideos: videos.length,
          totalWorkers: workers.length,
        },
      },
      tasks,
      workers,
      videos,
      activityLogs,
    },
  });
});

/**
 * Get uploaded videos associated with a specific supervisor
 */
exports.getSupervisorVideos = asyncHandler(async (req, res) => {
  const supervisor = await User.findOne({ _id: req.params.id, role: 'Supervisor' });
  if (!supervisor) {
    throw ApiError.notFound('Supervisor not found');
  }

  const videos = await Inspection.find({ supervisorId: req.params.id, videoUrl: { $ne: null } })
    .sort({ startedAt: -1 });

  res.json({
    success: true,
    data: {
      supervisorId: req.params.id,
      supervisorName: supervisor.name,
      videos,
    },
  });
});

/**
 * Upload an inspection video associated with a supervisor
 */
exports.uploadSupervisorVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Video file is required');
  }

  const {
    supervisorId,
    vehicleId,
    cameraId,
    cameraDirection,
    title,
    description,
    assignedArea,
    latitude,
    longitude,
  } = req.body;

  const targetSupervisorId = supervisorId || req.user._id;

  const videoFilename = req.file.filename;
  const videoUrl = `/api/evidence/videos/${videoFilename}`;
  const videoPath = req.file.path;
  const fileSize = req.file.size;
  const mimeType = req.file.mimetype || 'video/mp4';

  const location =
    latitude && longitude
      ? { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] }
      : undefined;

  const inspection = await Inspection.create({
    vehicleId: vehicleId || 'VH-001',
    supervisorId: targetSupervisorId,
    title: title || `Road Inspection - ${new Date().toLocaleDateString()}`,
    description: description || 'Routine municipal truck surveillance video capture',
    videoUrl,
    videoPath,
    videoFilename,
    fileSize,
    mimeType,
    cameraDirection: cameraDirection || 'Front',
    assignedArea: assignedArea || null,
    location,
    processingStatus: 'Completed',
    startedAt: new Date(),
    endedAt: new Date(),
    cameraIds: cameraId ? [cameraId] : ['CAM-F-001'],
    frameCount: 120,
    processedFrameCount: 120,
  });

  await logAction({
    actorId: req.user._id,
    actorRole: 'Supervisor',
    action: 'INSPECTION_STARTED',
    entityType: 'Inspection',
    entityId: inspection._id,
    metadata: {
      inspectionId: inspection.inspectionId,
      videoFilename,
      supervisorId: targetSupervisorId,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Inspection video uploaded successfully',
    data: {
      inspection,
      videoUrl,
    },
  });
});

/**
 * List all active workers with current workload counts
 */
exports.listWorkers = asyncHandler(async (req, res) => {
  const workers = await User.find({ role: 'Worker', isActive: true })
    .select('name email phone employeeId assignedArea department createdAt lastLoginAt');

  const workerData = await Promise.all(
    workers.map(async (worker) => {
      const taskCounts = await Task.aggregate([
        { $match: { workerId: worker._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);
      const counts = {};
      taskCounts.forEach((t) => {
        counts[t._id] = t.count;
      });
      return {
        ...worker.toJSON(),
        taskCounts: counts,
        totalTasks: Object.values(counts).reduce((a, b) => a + b, 0),
      };
    })
  );

  res.json({ success: true, data: { workers: workerData } });
});

/**
 * Get worker by ID with task history breakdown
 */
exports.getWorkerById = asyncHandler(async (req, res) => {
  const worker = await User.findById(req.params.id)
    .select('name email phone employeeId assignedArea department role isActive createdAt lastLoginAt');

  if (!worker || worker.role !== 'Worker') {
    throw ApiError.notFound('Worker not found');
  }

  const taskCounts = await Task.aggregate([
    { $match: { workerId: worker._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({ success: true, data: { worker, taskCounts } });
});

/**
 * Get tasks assigned to a specific worker
 */
exports.getWorkerTasks = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { workerId: req.params.id };
  if (req.query.status) filter.status = req.query.status;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort({ assignedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('issueId', 'issueCode type severity status description location address'),
    Task.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { tasks },
    pagination: buildPaginationResponse(page, limit, total),
  });
});

/**
 * Get tasks awaiting supervisor review (verification completed or failed)
 */
exports.getPendingReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { status: { $in: ['AwaitingSupervisorReview', 'VerificationFailed'] } };

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('workerId', 'name email phone employeeId')
      .populate('issueId', 'issueCode type severity description beforeImageUrl location address'),
    Task.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { tasks },
    pagination: buildPaginationResponse(page, limit, total),
  });
});

/**
 * Get review details with full side-by-side verification history
 */
exports.getReviewDetail = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId)
    .populate('workerId', 'name email phone employeeId')
    .populate('assignedBy', 'name email')
    .populate('issueId');

  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  res.json({
    success: true,
    data: {
      task,
      verificationHistory: task.verificationHistory,
      aiVerificationResult: task.aiVerificationResult,
    },
  });
});
