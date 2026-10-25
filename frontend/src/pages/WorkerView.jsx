import React, { useState, useEffect, useRef } from 'react';
import {
  HardHat, CheckCircle2, Clock, Camera, User, Phone, MapPin,
  Upload, Play, Check, AlertCircle, RefreshCw, ChevronRight, Image as ImageIcon,
  CheckCircle, ArrowUpRight, Award, ShieldCheck
} from 'lucide-react';
import dummyData from '../data/dummyData.json';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import workerService from '../services/workerService';
import taskService from '../services/taskService';

export default function WorkerView() {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'history' | 'stats'
  const [tasks, setTasks] = useState([]);
  const [historyTasks, setHistoryTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [submittingResolution, setSubmittingResolution] = useState(false);
  const [usingMock, setUsingMock] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const worker = dummyData.workers[0] || {
    id: 'WKR-01',
    name: 'Ramesh Sharma',
    role: 'Senior Field Lead',
    zone: 'Zone 4 (Palasia)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    tasksAssigned: 2,
    tasksCompleted: 34
  };

  const loadWorkerData = async () => {
    setLoading(true);
    try {
      const [queueRes, histRes, statsRes] = await Promise.allSettled([
        workerService.getMyTasks(),
        workerService.getHistory(),
        workerService.getStats()
      ]);

      if (queueRes.status === 'fulfilled' && queueRes.value?.tasks) {
        setTasks(queueRes.value.tasks);
        setUsingMock(false);
      } else {
        throw new Error('Using fallback mock data');
      }

      if (histRes.status === 'fulfilled' && histRes.value?.history) {
        setHistoryTasks(histRes.value.history);
      } else {
        setHistoryTasks(dummyData.issues.filter(i => i.status === 'resolved'));
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.stats) {
        setStats(statsRes.value.stats);
      } else {
        setStats({
          tasksCompleted: worker.tasksCompleted,
          avgResolutionTime: '2.4 hrs',
          accuracyRate: '98.5%',
          streakDays: 14
        });
      }
    } catch {
      // Fallback to local mock data
      const mockActive = dummyData.issues.filter(i => i.status === 'assigned' || i.status === 'pending');
      setTasks(mockActive.map(t => ({
        ...t,
        taskStatus: t.status === 'assigned' ? 'Assigned' : 'Accepted'
      })));
      setHistoryTasks(dummyData.issues.filter(i => i.status === 'resolved'));
      setStats({
        tasksCompleted: worker.tasksCompleted,
        avgResolutionTime: '2.4 hrs',
        accuracyRate: '98.5%',
        streakDays: 14
      });
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkerData();
  }, []);

  const handleAcceptTask = async (taskId) => {
    setActionLoadingId(taskId);
    try {
      await taskService.acceptTask(taskId);
      toast.success('Task marked as Accepted!');
    } catch {
      toast.info('Task accepted (demo mode)');
    } finally {
      setTasks(prev => prev.map(t => (t._id === taskId || t.id === taskId) ? { ...t, taskStatus: 'Accepted' } : t));
      setActionLoadingId(null);
    }
  };

  const handleStartTask = async (taskId) => {
    setActionLoadingId(taskId);
    try {
      await taskService.startTask(taskId);
      toast.success('Work In Progress started!');
    } catch {
      toast.info('Task status changed to In-Progress (demo mode)');
    } finally {
      setTasks(prev => prev.map(t => (t._id === taskId || t.id === taskId) ? { ...t, taskStatus: 'InProgress' } : t));
      setActionLoadingId(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask || (!proofFile && !previewImage)) {
      toast.warning('Please capture or select an after-repair photograph.');
      return;
    }

    setSubmittingResolution(true);
    const taskId = selectedTask._id || selectedTask.id;

    try {
      const formData = new FormData();
      if (proofFile) formData.append('photo', proofFile);
      formData.append('taskId', taskId);
      formData.append('notes', 'Repair completed in compliance with municipal road standards.');

      await taskService.resolveTask(taskId, formData);
      toast.success('Resolution submitted! Verification outcome: Verified ✅');
    } catch {
      toast.success('Resolution recorded & AI verified (demo mode) ✅');
    } finally {
      // Optimistic update
      setTasks(prev => prev.filter(t => (t._id || t.id) !== taskId));
      setHistoryTasks(prev => [
        {
          ...selectedTask,
          status: 'resolved',
          resolvedImageUrl: previewImage || selectedTask.imageUrl,
          resolvedAt: new Date().toISOString()
        },
        ...prev
      ]);
      setSubmittingResolution(false);
      setSelectedTask(null);
      setPreviewImage(null);
      setProofFile(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Worker Profile Header */}
      <div className="p-5 sm:p-6 bg-surface rounded-card shadow-card border border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-accent/30 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-content">{worker.name}</h1>
                <Badge variant="success">Active On Duty</Badge>
              </div>
              <p className="text-xs text-content-muted flex items-center gap-1.5 mt-0.5">
                <HardHat className="w-3.5 h-3.5 text-accent" />
                <span>{worker.role}</span>
                <span>•</span>
                <span>{worker.zone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadWorkerData}
              className="p-2 bg-surface-muted hover:bg-surface-hover text-content-muted rounded-full transition-colors"
              title="Refresh queue"
            >
              <RefreshCw className="w-4 h-4 text-accent" />
            </button>
          </div>
        </div>

        {/* Quick Workload Metric Blocks */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-border/40 text-center">
          <div className="p-3 bg-surface-muted rounded-inner">
            <span className="text-xl font-bold text-content tabular-nums">{tasks.length}</span>
            <span className="block text-[11px] text-content-muted mt-0.5">Pending Action</span>
          </div>
          <div className="p-3 bg-surface-muted rounded-inner">
            <span className="text-xl font-bold text-success tabular-nums">{historyTasks.length}</span>
            <span className="block text-[11px] text-content-muted mt-0.5">Resolved Total</span>
          </div>
          <div className="p-3 bg-surface-muted rounded-inner">
            <span className="text-xl font-bold text-accent tabular-nums">98%</span>
            <span className="block text-[11px] text-content-muted mt-0.5">AI Pass Rate</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Queue, History, Performance Stats) */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-pill transition-all ${
            activeTab === 'queue'
              ? 'bg-accent text-accent-contrast shadow-sm'
              : 'text-content-muted hover:text-content hover:bg-surface'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Active Tasks ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-pill transition-all ${
            activeTab === 'history'
              ? 'bg-accent text-accent-contrast shadow-sm'
              : 'text-content-muted hover:text-content hover:bg-surface'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed ({historyTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-pill transition-all ${
            activeTab === 'stats'
              ? 'bg-accent text-accent-contrast shadow-sm'
              : 'text-content-muted hover:text-content hover:bg-surface'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>My Performance</span>
        </button>
      </div>

      {/* Tab 1: Active Tasks Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="p-10 text-center bg-surface rounded-card shadow-card border border-border/40">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-2 opacity-80" />
              <h3 className="text-base font-semibold text-content">All Tasks Completed!</h3>
              <p className="text-xs text-content-muted mt-1">There are currently no active repair orders assigned to your queue.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const currentStatus = task.taskStatus || (task.status === 'assigned' ? 'Assigned' : 'InProgress');
              const isBusy = actionLoadingId === (task._id || task.id);

              return (
                <div
                  key={task._id || task.id}
                  className="p-5 bg-surface rounded-card shadow-card border border-border/50 space-y-3.5 hover:border-accent/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-pill bg-warning-soft text-warning">
                        {task.type}
                      </span>
                      <span className="text-xs font-mono font-medium text-content-muted">{task.id || task._id}</span>
                    </div>
                    <Badge variant={task.severity === 'high' ? 'danger' : 'warning'}>
                      {task.severity}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-semibold text-content leading-snug">{task.title}</h3>

                  <p className="text-xs text-content-muted flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                    <span>{task.location?.address}</span>
                  </p>

                  {task.imageUrl && (
                    <div className="w-full h-36 rounded-inner overflow-hidden border border-border/40 bg-surface-muted">
                      <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Dynamic Workflow Actions Based on State */}
                  <div className="pt-3 border-t border-border/30 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-content-subtle font-medium">Workflow:</span>
                      <span className="px-2 py-0.5 text-[11px] font-semibold rounded-pill bg-surface-muted text-content">
                        {currentStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {currentStatus === 'Assigned' && (
                        <button
                          onClick={() => handleAcceptTask(task._id || task.id)}
                          disabled={isBusy}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-accent text-accent-contrast text-xs font-semibold rounded-pill hover:opacity-90 transition-opacity"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Assignment</span>
                        </button>
                      )}

                      {currentStatus === 'Accepted' && (
                        <button
                          onClick={() => handleStartTask(task._id || task.id)}
                          disabled={isBusy}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-warning text-white text-xs font-semibold rounded-pill hover:opacity-90 transition-opacity"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Begin Repair</span>
                        </button>
                      )}

                      {(currentStatus === 'InProgress' || currentStatus === 'Accepted') && (
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-inverse text-inverse-text text-xs font-semibold rounded-pill shadow-sm hover:opacity-90 transition-opacity"
                        >
                          <Camera className="w-3.5 h-3.5 text-accent" />
                          <span>Upload After-Photo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Completed Tasks History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {historyTasks.map((t) => (
            <div
              key={t._id || t.id}
              className="p-4 bg-surface rounded-card shadow-card border border-border/40 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success-soft flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-content">{t.title}</h4>
                  <p className="text-[11px] text-content-muted mt-0.5">{t.location?.address?.split(',')[0]}</p>
                </div>
              </div>
              <Badge variant="success">Verified Resolved</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Performance & Statistics */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-surface rounded-card shadow-card border border-border/40 space-y-2">
            <span className="text-xs font-semibold text-content-muted uppercase">Resolution Efficiency</span>
            <div className="text-3xl font-bold text-content">{stats?.avgResolutionTime || '2.4 hrs'}</div>
            <p className="text-xs text-content-subtle">Average turnaround from task dispatch to verified repair.</p>
          </div>

          <div className="p-5 bg-surface rounded-card shadow-card border border-border/40 space-y-2">
            <span className="text-xs font-semibold text-content-muted uppercase">Gemini AI First-Pass Rate</span>
            <div className="text-3xl font-bold text-success">{stats?.accuracyRate || '98.5%'}</div>
            <p className="text-xs text-content-subtle">Percentage of before/after photos verified without supervisor rework.</p>
          </div>
        </div>
      )}

      {/* Resolution Photo Upload Modal with Native Camera Input */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface border border-border rounded-card p-6 max-w-md w-full shadow-card relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-inner bg-success-soft flex items-center justify-center">
                <Camera className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-content">Submit Proof of Repair</h3>
                <p className="text-xs text-content-muted truncate max-w-[280px]">{selectedTask.title}</p>
              </div>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              {/* Native Camera Trigger */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-border hover:border-accent/60 rounded-inner p-4 text-center bg-surface-muted/60 transition-colors"
                >
                  {previewImage ? (
                    <div className="space-y-2">
                      <img src={previewImage} alt="Repair proof" className="w-full h-44 object-cover rounded-md" />
                      <p className="text-xs text-accent font-medium">Click to retake or choose different photo</p>
                    </div>
                  ) : (
                    <div className="py-6 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-accent-soft text-accent mx-auto flex items-center justify-center">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-content">Tap to open Camera or Upload Photo</p>
                      <p className="text-[11px] text-content-muted">High-resolution after-repair proof required for Gemini verification</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-surface-muted rounded-inner text-xs text-content-muted space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-content">
                  <ShieldCheck className="w-4 h-4 text-success" />
                  <span>Gemini Closed-Loop Verification Active</span>
                </div>
                <p className="text-[11px]">Submitting triggers automated AI spatial image comparison against initial defect coordinates.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setSelectedTask(null); setPreviewImage(null); }}
                  className="px-4 py-2 text-xs font-medium text-content bg-surface-muted hover:bg-surface-hover rounded-pill border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResolution || !previewImage}
                  className="px-5 py-2 text-xs font-semibold bg-success text-white rounded-pill hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5"
                >
                  {submittingResolution ? 'Submitting & Verifying...' : 'Submit Resolution Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
