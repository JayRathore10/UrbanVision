import React, { useState, useEffect, useCallback } from 'react';
import { 
  HardHat, 
  CheckCircle2, 
  Clock, 
  Camera, 
  User, 
  Phone, 
  MapPin, 
  Play, 
  Check, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight,
  ShieldAlert,
  Loader2,
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function WorkerView() {
  const { user, isWorker, switchAccount } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Resolution modal state
  const [activeTaskToResolve, setActiveTaskToResolve] = useState(null);
  const [resolutionPhoto, setResolutionPhoto] = useState(null);
  const [workerNotes, setWorkerNotes] = useState('');
  const [submittingResolution, setSubmittingResolution] = useState(false);
  const [resolutionResult, setResolutionResult] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchWorkerTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // If user is not worker, we prompt to switch to a worker
      if (user?.role !== 'Worker') {
        setLoading(false);
        return;
      }

      const [tasksRes, statsRes] = await Promise.allSettled([
        api.worker.getMyTasks(),
        api.worker.getStats(),
      ]);

      if (tasksRes.status === 'fulfilled' && tasksRes.value.data?.tasks) {
        setTasks(tasksRes.value.data.tasks);
      } else if (tasksRes.status === 'rejected') {
        setError(tasksRes.reason?.message || 'Could not fetch tasks for this worker.');
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        setStats(statsRes.value.data);
      }
    } catch (err) {
      console.error('[WorkerView] Error loading worker tasks:', err);
      setError(err.message || 'Failed to load task queue');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWorkerTasks();
  }, [fetchWorkerTasks]);

  // Task Action: Accept
  const handleAcceptTask = async (taskId) => {
    try {
      setActionLoadingId(taskId);
      await api.worker.acceptTask(taskId);
      fetchWorkerTasks();
    } catch (err) {
      alert(`Could not accept task: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Task Action: Start
  const handleStartTask = async (taskId) => {
    try {
      setActionLoadingId(taskId);
      await api.worker.startTask(taskId);
      fetchWorkerTasks();
    } catch (err) {
      alert(`Could not start task: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Task Action: Resolve with Photo
  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionPhoto) {
      alert('Please take or upload an after-repair photograph');
      return;
    }

    setSubmittingResolution(true);
    setResolutionResult(null);

    try {
      const formData = new FormData();
      formData.append('image', resolutionPhoto);
      formData.append('workerNotes', workerNotes || 'Repair completed by municipal crew.');
      if (activeTaskToResolve?.issueId?.location?.coordinates) {
        const [lng, lat] = activeTaskToResolve.issueId.location.coordinates;
        formData.append('longitude', lng);
        formData.append('latitude', lat);
      }

      const res = await api.worker.resolveTask(activeTaskToResolve._id, formData);
      setResolutionResult(res);

      // Refresh task list
      fetchWorkerTasks();
    } catch (err) {
      console.error('[WorkerView] Resolve failed:', err);
      alert(`Failed to submit repair proof: ${err.message}`);
    } finally {
      setSubmittingResolution(false);
    }
  };

  // If user is currently a Supervisor, show a quick prompt to switch to a worker
  if (user?.role !== 'Worker') {
    return (
      <div className="max-w-xl mx-auto p-8 bg-surface rounded-card shadow-card border border-border/60 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
          <HardHat className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-content">Municipal Worker Portal</h2>
        <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
          You are currently signed in as a <strong>Supervisor</strong> ({user?.name}). The Worker Mobile Interface requires a municipal field technician account.
        </p>
        <div className="p-4 bg-surface-muted rounded-inner text-xs text-content space-y-2 border border-border/50 text-left">
          <p className="font-semibold text-accent uppercase tracking-wider text-[11px]">
            Switch to a Field Worker:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { name: 'Amit Verma', email: 'amit@urbanvision.gov.in', area: 'Zone 1 - Rajwada' },
              { name: 'Sunita Patel', email: 'sunita@urbanvision.gov.in', area: 'Zone 1 - Rajwada' },
              { name: 'Rahul Sharma', email: 'rahul@urbanvision.gov.in', area: 'Zone 2 - Vijay Nagar' },
              { name: 'Vikram Singh', email: 'vikram@urbanvision.gov.in', area: 'Zone 2 - Vijay Nagar' },
            ].map((worker) => (
              <button
                key={worker.email}
                onClick={async () => {
                  await switchAccount(worker.email, 'Password123');
                }}
                className="p-3 bg-surface hover:bg-surface-hover border border-border rounded-inner text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-content">{worker.name}</p>
                  <p className="text-[10px] text-content-muted">{worker.area}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-accent" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const assignedCount = tasks.filter((t) => t.status === 'Assigned').length;
  const inProgressCount = tasks.filter((t) => t.status === 'InProgress' || t.status === 'Accepted').length;
  const resolvedCount = tasks.filter((t) => t.status === 'Resolved').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Worker Profile Header Card */}
      <div className="p-6 bg-surface rounded-card shadow-card border border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-accent/30">
              {user.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-content">{user.name}</h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-success-soft text-success rounded-pill uppercase">
                  Active On Duty
                </span>
              </div>
              <p className="text-xs text-content-muted flex items-center gap-1.5 flex-wrap">
                <HardHat className="w-3.5 h-3.5 text-accent" />
                <span>Field Maintenance Crew</span>
                <span>•</span>
                <span className="font-mono">{user.employeeId}</span>
                <span>•</span>
                <span className="text-accent font-medium">📍 {user.assignedArea}</span>
              </p>
            </div>
          </div>

          <button
            onClick={fetchWorkerTasks}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface text-content text-xs font-medium rounded-pill border border-border shadow-sm hover:bg-surface-hover self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-accent ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Worker KPI Quick Grid */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-border/40">
          <div className="p-3 bg-surface-muted rounded-inner text-center">
            <span className="text-2xl font-bold text-content tabular-nums">{assignedCount}</span>
            <span className="block text-[11px] text-content-muted mt-0.5">Assigned to Me</span>
          </div>
          <div className="p-3 bg-surface-muted rounded-inner text-center">
            <span className="text-2xl font-bold text-accent tabular-nums">{inProgressCount}</span>
            <span className="block text-[11px] text-content-muted mt-0.5">In Progress</span>
          </div>
          <div className="p-3 bg-surface-muted rounded-inner text-center">
            <span className="text-2xl font-bold text-success tabular-nums">{resolvedCount}</span>
            <span className="block text-[11px] text-content-muted mt-0.5">Verified Resolved</span>
          </div>
          <div className="p-3 bg-surface-muted rounded-inner">
            <span className="text-xl font-bold text-accent tabular-nums">98%</span>
            <span className="block text-[11px] text-content-muted mt-0.5">AI Pass Rate</span>
          </div>
        </div>
      </div>

      {/* Task Queue Section */}
      <div className="p-6 bg-surface rounded-card shadow-card border border-border/50 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-content flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <span>Assigned Maintenance Work Orders ({tasks.length})</span>
            </h2>
            <p className="text-xs text-content-muted">
              Accept task, execute road repair on site, and photograph proof for AI verification.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-2">
            <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
            <p className="text-xs text-content-muted">Loading assigned field tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center space-y-2 bg-surface-muted rounded-inner border border-border/40">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
            <p className="text-sm font-semibold text-content">All Clear! No Pending Tasks</p>
            <p className="text-xs text-content-muted">
              New road maintenance requests dispatched by your supervisor will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const issue = task.issueId;
              const isActionLoading = actionLoadingId === task._id;

              return (
                <div
                  key={task._id}
                  className="p-5 bg-surface-muted rounded-card border border-border/60 space-y-3 hover:border-accent/40 transition-colors shadow-sm"
                >
                  {/* Top Bar: Code, Category, Severity */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-content">
                          {task.taskCode || task._id.substring(0, 8)}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-pill bg-accent-soft text-accent uppercase">
                          {issue?.type || 'Civic Anomaly'}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-pill uppercase ${
                          task.priority === 'Critical'
                            ? 'bg-danger-soft text-danger'
                            : task.priority === 'High'
                            ? 'bg-warning-soft text-warning'
                            : 'bg-surface text-content-muted'
                        }`}>
                          {task.priority || 'Medium'} Priority
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-content mt-1">
                        {issue?.description || 'Municipal infrastructure repair order'}
                      </p>
                    </div>

                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-pill ${
                      task.status === 'Resolved'
                        ? 'bg-success-soft text-success'
                        : task.status === 'InProgress'
                        ? 'bg-accent-soft text-accent'
                        : task.status === 'Accepted'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : task.status === 'UnderReview' || task.status === 'AwaitingVerification'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-warning-soft text-warning'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  {/* Location & Instructions */}
                  <div className="space-y-1 text-xs text-content-muted">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span>{issue?.address || 'Indore Urban Road'}</span>
                      {issue?.location?.coordinates && (
                        <span className="font-mono text-[10px] text-content-subtle">
                          [{issue.location.coordinates[1].toFixed(4)}, {issue.location.coordinates[0].toFixed(4)}]
                        </span>
                      )}
                    </p>

                    {task.instructions && (
                      <p className="p-2.5 bg-surface rounded-inner border border-border/40 text-[11px] text-content">
                        <strong>Supervisor Note:</strong> {task.instructions}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons based on task status */}
                  <div className="pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] text-content-subtle font-mono">
                      Assigned: {new Date(task.assignedAt || task.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {task.status === 'Assigned' && (
                        <button
                          onClick={() => handleAcceptTask(task._id)}
                          disabled={isActionLoading}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-accent text-white text-xs font-semibold rounded-pill shadow-sm hover:opacity-90 disabled:opacity-50"
                        >
                          {isActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          <span>Accept Assignment</span>
                        </button>
                      )}

                      {task.status === 'Accepted' && (
                        <button
                          onClick={() => handleStartTask(task._id)}
                          disabled={isActionLoading}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-accent text-white text-xs font-semibold rounded-pill shadow-sm hover:opacity-90 disabled:opacity-50"
                        >
                          {isActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                          <span>Start Repair Work</span>
                        </button>
                      )}

                      {task.status === 'InProgress' && (
                        <button
                          onClick={() => {
                            setActiveTaskToResolve(task);
                            setResolutionResult(null);
                            setResolutionPhoto(null);
                            setWorkerNotes('');
                          }}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-pill shadow-sm hover:opacity-90"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Submit Repair Photo</span>
                        </button>
                      )}

                      {(task.status === 'UnderReview' || task.status === 'AwaitingVerification') && (
                        <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                          <span>AI Verification Pending Review</span>
                        </span>
                      )}

                      {task.status === 'Resolved' && (
                        <span className="text-xs text-success font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verification Passed & Task Closed</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Proof of Work / Photo Resolution Modal */}
      {activeTaskToResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-card max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setActiveTaskToResolve(null)}
              className="absolute top-4 right-4 p-1.5 text-content-muted hover:text-content rounded-full hover:bg-surface-muted"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-accent-soft text-accent rounded-pill uppercase">
                  Maintenance Completion
                </span>
                <span className="text-xs font-mono text-content-muted">{activeTaskToResolve.taskCode}</span>
              </div>
              <h3 className="text-base font-bold text-content mt-1">
                Upload After-Repair Photograph
              </h3>
              <p className="text-xs text-content-muted">
                Our Gemini AI vision model will automatically inspect your photo against the original defect to verify the repair.
              </p>
            </div>

            {resolutionResult ? (
              <div className="p-4 bg-surface-muted rounded-card border border-border/60 space-y-3">
                <div className="flex items-center gap-2 text-success font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{resolutionResult.message || 'Evidence received and evaluated!'}</span>
                </div>

                {resolutionResult.data?.aiVerificationResult && (
                  <div className="p-3 bg-surface rounded-inner border border-border/40 text-xs space-y-1">
                    <p className="font-semibold text-content flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                      Gemini AI Verification Result:
                    </p>
                    <p className="text-content-muted">
                      Status: <strong>{resolutionResult.data.aiVerificationResult.verified ? 'Verified Resolved' : 'Flagged for Inspection'}</strong>
                    </p>
                    <p className="text-content-muted">
                      Confidence Score: <strong>{Math.round((resolutionResult.data.aiVerificationResult.confidence || 0.85) * 100)}%</strong>
                    </p>
                    {resolutionResult.data.aiVerificationResult.notes && (
                      <p className="text-[11px] text-content-subtle mt-1">
                        "{resolutionResult.data.aiVerificationResult.notes}"
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setActiveTaskToResolve(null)}
                    className="px-5 py-2 bg-accent text-white text-xs font-semibold rounded-pill"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResolveSubmit} className="space-y-4">
                {/* File picker */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-content">After-Repair Photo</label>
                  <div className="border-2 border-dashed border-border/80 hover:border-accent rounded-card p-6 text-center bg-surface-muted/50 cursor-pointer transition-colors">
                    <input
                      type="file"
                      id="repairPhotoInput"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setResolutionPhoto(file);
                      }}
                      className="hidden"
                    />
                    <label htmlFor="repairPhotoInput" className="cursor-pointer block space-y-2">
                      <Camera className="w-8 h-8 text-accent mx-auto animate-pulse" />
                      <div className="text-xs text-content font-medium">
                        {resolutionPhoto ? (
                          <span className="text-accent font-semibold">
                            Selected: {resolutionPhoto.name}
                          </span>
                        ) : (
                          <span>Click to snap or upload after-repair photograph</span>
                        )}
                      </div>
                      <p className="text-[11px] text-content-muted">JPEG, PNG or WebP</p>
                    </label>
                  </div>
                </div>

                {/* Worker notes */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-content">Technician Work Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Cleared clogged drain line and sanitized surrounding pavement."
                    value={workerNotes}
                    onChange={(e) => setWorkerNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-surface-muted border border-border rounded-inner focus:outline-none focus:ring-1 focus:ring-accent text-content"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTaskToResolve(null)}
                    className="px-4 py-2 bg-surface text-content text-xs font-medium rounded-pill border border-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingResolution || !resolutionPhoto}
                    className="flex items-center gap-2 px-5 py-2 bg-accent text-white text-xs font-semibold rounded-pill shadow-sm hover:opacity-90 disabled:opacity-50"
                  >
                    {submittingResolution ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying with AI...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit for Verification</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
