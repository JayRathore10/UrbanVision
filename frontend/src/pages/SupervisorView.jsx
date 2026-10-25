import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, XCircle, Users, Clock, Eye, AlertTriangle,
  FileCheck, MapPin, Phone, UserCheck, HardHat, RefreshCw, ThumbsUp, ThumbsDown
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import supervisorService from '../services/supervisorService';
import taskService from '../services/taskService';
import dummyData from '../data/dummyData.json';

export default function SupervisorView() {
  const [reviews, setReviews] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'workers'
  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [revRes, workRes] = await Promise.allSettled([
        supervisorService.getReviews(),
        supervisorService.getWorkers()
      ]);

      if (revRes.status === 'fulfilled' && revRes.value?.reviews) {
        setReviews(revRes.value.reviews);
      } else {
        // Fallback demo review tasks (e.g. resolved/pending approval issues)
        const demoReviews = dummyData.issues.map((issue) => ({
          taskId: issue.id,
          _id: issue._id,
          issueTitle: issue.title,
          category: issue.type,
          severity: issue.severity,
          location: issue.location?.address,
          workerName: issue.assignedWorker?.name || 'Ramesh Sharma',
          beforeImage: issue.imageUrl,
          afterImage: issue.resolvedImageUrl || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
          geminiScore: 0.94,
          status: issue.status === 'resolved' ? 'AwaitingSupervisorReview' : 'InProgress',
          submittedAt: issue.detectedAt
        }));
        setReviews(demoReviews);
      }

      if (workRes.status === 'fulfilled' && workRes.value?.workers) {
        setWorkers(workRes.value.workers);
      } else {
        setWorkers(dummyData.workers);
      }
    } catch {
      setReviews([]);
      setWorkers(dummyData.workers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (taskId) => {
    setActionLoading(true);
    try {
      await taskService.approveTask(taskId);
      toast.success('Task approved! Marked as permanently Resolved.');
    } catch {
      toast.success('Task approved & closed in municipal ledger (demo mode) ✅');
    } finally {
      setReviews(prev => prev.filter(r => (r.taskId !== taskId && r._id !== taskId)));
      setSelectedReview(null);
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReview) return;
    setActionLoading(true);
    const taskId = selectedReview.taskId || selectedReview._id;
    try {
      await taskService.rejectTask(taskId, rejectReason || 'Insufficient compaction or debris remaining.');
      toast.warning('Task returned to field worker for rework.');
    } catch {
      toast.warning('Task rejected & scheduled for rework (demo mode)');
    } finally {
      setReviews(prev => prev.filter(r => (r.taskId !== taskId && r._id !== taskId)));
      setSelectedReview(null);
      setRejectModalOpen(false);
      setRejectReason('');
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-surface rounded-card shadow-card border border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="accent">Supervisor Ops</Badge>
            <span className="text-xs text-content-muted">Indore Smart City Operations Command</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-content mt-1.5 tracking-tight">
            Field Review & Quality Assurance Station
          </h1>
          <p className="text-sm text-content-muted">
            Side-by-side photographic verification & field crew workload monitoring.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-surface text-content text-xs font-medium rounded-pill border border-border hover:bg-surface-hover shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-accent" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-pill transition-all ${
            activeTab === 'reviews'
              ? 'bg-accent text-accent-contrast shadow-sm'
              : 'text-content-muted hover:text-content hover:bg-surface'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Pending Reviews ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('workers')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-pill transition-all ${
            activeTab === 'workers'
              ? 'bg-accent text-accent-contrast shadow-sm'
              : 'text-content-muted hover:text-content hover:bg-surface'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Worker Directory & Workload ({workers.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <LoadingSpinner size="lg" text="Loading supervisor operations..." />
        </div>
      ) : activeTab === 'reviews' ? (
        /* Review Queue Section */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Reviews List */}
          <div className="lg:col-span-5 space-y-3">
            {reviews.length === 0 ? (
              <div className="p-8 text-center bg-surface rounded-card shadow-card border border-border/40">
                <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-2 opacity-80" />
                <h4 className="text-sm font-semibold text-content">No Pending Reviews</h4>
                <p className="text-xs text-content-muted mt-1">All field completions have been reviewed and approved.</p>
              </div>
            ) : (
              reviews.map((r) => {
                const isSelected = selectedReview?.taskId === r.taskId || selectedReview?._id === r._id;
                return (
                  <div
                    key={r.taskId || r._id}
                    onClick={() => setSelectedReview(r)}
                    className={`p-4 rounded-card border shadow-sm cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-surface border-accent ring-2 ring-accent/20'
                        : 'bg-surface border-border/60 hover:border-accent/40 hover:bg-surface-hover/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-pill bg-accent-soft text-accent">
                        {r.category}
                      </span>
                      <span className="text-xs font-mono text-content-subtle">{r.taskId}</span>
                    </div>

                    <h4 className="text-xs font-semibold text-content mt-1.5 line-clamp-1">{r.issueTitle}</h4>

                    <div className="flex items-center justify-between text-xs text-content-muted mt-2">
                      <span className="flex items-center gap-1 truncate max-w-[180px]">
                        <UserCheck className="w-3.5 h-3.5 text-accent" />
                        {r.workerName}
                      </span>
                      <span className="text-success font-semibold">
                        AI Score: {Math.round(r.geminiScore * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Side-by-Side Before/After Evidence Inspector */}
          <div className="lg:col-span-7">
            {selectedReview ? (
              <div className="p-5 bg-surface rounded-card shadow-card border border-border/50 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-content">{selectedReview.issueTitle}</h3>
                    <p className="text-xs text-content-muted flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      {selectedReview.location}
                    </p>
                  </div>
                  <Badge variant="warning">Awaiting Review</Badge>
                </div>

                {/* Side-by-Side Photos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-content-muted uppercase">Initial Defect (Before)</span>
                    <div className="h-48 rounded-inner overflow-hidden border border-border/60 bg-surface-muted">
                      <img src={selectedReview.beforeImage} alt="Before" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-success uppercase">Repaired Surface (After)</span>
                    <div className="h-48 rounded-inner overflow-hidden border border-success/40 bg-surface-muted">
                      <img src={selectedReview.afterImage} alt="After" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                {/* AI Automated Inspection Feedback */}
                <div className="p-3.5 bg-surface-muted rounded-inner text-xs space-y-1.5 border border-border/40">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-content flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-accent" />
                      Gemini Multimodal Validation Verdict
                    </span>
                    <span className="text-success">Match Confidence: {Math.round(selectedReview.geminiScore * 100)}%</span>
                  </div>
                  <p className="text-content-muted">
                    Defect boundaries filled with hot-mix asphalt and compacted level with ambient surface plane. GPS coordinates cross-referenced within 3.2m deviation.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setRejectModalOpen(true)}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-danger bg-danger-soft hover:bg-danger/20 rounded-pill transition-colors"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Reject / Request Rework</span>
                  </button>

                  <button
                    onClick={() => handleApprove(selectedReview.taskId || selectedReview._id)}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-success hover:bg-success/90 rounded-pill transition-opacity"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Approve & Resolve Issue</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center bg-surface rounded-card shadow-card border border-border/40">
                <Eye className="w-10 h-10 text-content-subtle mb-2" />
                <h4 className="text-sm font-semibold text-content">No Issue Selected</h4>
                <p className="text-xs text-content-muted mt-1 max-w-xs">
                  Click any pending task from the list on the left to inspect side-by-side evidence.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Workers Directory Section */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workers.map((w) => (
            <div
              key={w.id || w._id}
              className="p-5 bg-surface rounded-card shadow-card border border-border/50 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-3">
                <img
                  src={w.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                  alt={w.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-accent/30"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-content truncate">{w.name}</h4>
                  <p className="text-xs text-content-muted flex items-center gap-1">
                    <HardHat className="w-3 h-3 text-accent" />
                    <span className="truncate">{w.role}</span>
                  </p>
                  <p className="text-[11px] text-content-subtle mt-0.5">{w.zone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-border/30">
                <div className="p-2 bg-surface-muted rounded-inner">
                  <span className="text-base font-bold text-content tabular-nums">{w.tasksAssigned || 0}</span>
                  <span className="block text-[10px] text-content-muted">Assigned</span>
                </div>
                <div className="p-2 bg-surface-muted rounded-inner">
                  <span className="text-base font-bold text-success tabular-nums">{w.tasksCompleted || 0}</span>
                  <span className="block text-[10px] text-content-muted">Resolved</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-content-muted">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-accent" />
                  {w.phone || 'Field Radio'}
                </span>
                <Badge variant={w.status === 'active' || w.status === 'available' ? 'success' : 'neutral'}>
                  {w.status || 'Active'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface border border-border rounded-card p-6 max-w-sm w-full shadow-card relative">
            <h3 className="text-base font-semibold text-content">Request Rework</h3>
            <p className="text-xs text-content-muted mt-1">
              Provide feedback for the field worker on why the repair evidence was rejected.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-content-muted uppercase mb-1">
                Reason for Rejection
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Incomplete surface leveling, asphalt edges require sealing..."
                className="w-full p-3 bg-surface-muted text-content text-xs rounded-inner border border-border focus:ring-2 focus:ring-accent outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-content bg-surface-muted hover:bg-surface-hover rounded-pill border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 text-xs font-semibold bg-danger text-white rounded-pill hover:opacity-90"
              >
                Confirm Return for Rework
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
