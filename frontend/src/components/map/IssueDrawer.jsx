import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  UserCheck, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Camera, 
  HardHat, 
  Clock,
  Sparkles,
  ExternalLink,
  Shield
} from 'lucide-react';
import { api } from '../../services/api';

export default function IssueDrawer({
  issue,
  onClose,
  onIssueUpdated,
}) {
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [priority, setPriority] = useState('High');
  const [instructions, setInstructions] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Fetch active workers list for task dispatch
  useEffect(() => {
    let isMounted = true;
    api.supervisors
      .listWorkers()
      .then((res) => {
        if (isMounted && res.data?.workers) {
          setWorkers(res.data.workers);
        }
      })
      .catch((err) => console.warn('[IssueDrawer] Could not load workers:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  if (!issue) return null;

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      setFeedback({ type: 'error', text: 'Please select an active field worker' });
      return;
    }

    setAssigning(true);
    setFeedback(null);

    try {
      const res = await api.tasks.assign({
        issueId: issue._id || issue.id,
        workerId: selectedWorkerId,
        priority,
        instructions,
      });

      setFeedback({ type: 'success', text: `Task assigned successfully: ${res.data?.task?.taskCode || 'Dispatched'}` });
      if (onIssueUpdated) {
        onIssueUpdated();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to dispatch task' });
    } finally {
      setAssigning(false);
    }
  };

  const coordinates = issue.location?.coordinates || [];
  const [lng, lat] = coordinates;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-surface shadow-2xl border-l border-border flex flex-col font-sans transition-transform duration-300">
      {/* Drawer Header */}
      <div className="p-5 border-b border-border/50 flex items-center justify-between bg-surface-muted/50">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-sm font-bold text-accent">{issue.issueCode}</span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill uppercase ${
              issue.status === 'Resolved'
                ? 'bg-success-soft text-success'
                : issue.status === 'InProgress' || issue.status === 'Assigned'
                ? 'bg-accent-soft text-accent'
                : 'bg-danger-soft text-danger'
            }`}
          >
            {issue.status}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-surface-hover text-content-muted hover:text-content transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Issue Evidence Photo */}
        <div className="relative aspect-video rounded-inner overflow-hidden bg-surface-muted border border-border/40 shadow-sm flex items-center justify-center">
          {issue.beforeImageUrl ? (
            <img
              src={issue.beforeImageUrl}
              alt={issue.type}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=640&q=80';
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-content-muted">
              <Camera className="w-8 h-8 text-accent/50" />
              <span className="text-xs">Camera Snapshot Available</span>
            </div>
          )}

          <div className="absolute top-2 left-2 bg-inverse/80 backdrop-blur-sm text-inverse-text text-[10px] font-medium px-2 py-0.5 rounded-pill flex items-center gap-1">
            <Camera className="w-3 h-3 text-accent" />
            <span>Cam: {issue.cameraDirection || 'Front'}</span>
          </div>

          <div className="absolute bottom-2 right-2 bg-inverse/80 backdrop-blur-sm text-inverse-text text-[10px] font-medium px-2 py-0.5 rounded-pill flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-accent" />
            <span>AI Conf: {Math.round((issue.confidenceScore || 0.9) * 100)}%</span>
          </div>
        </div>

        {/* Title & Core Attributes */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-content capitalize">{issue.type}</h2>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-pill ${
                issue.severity === 'Critical'
                  ? 'bg-danger text-white'
                  : issue.severity === 'High'
                  ? 'bg-danger-soft text-danger'
                  : issue.severity === 'Medium'
                  ? 'bg-warning-soft text-warning'
                  : 'bg-surface-muted text-content-muted'
              }`}
            >
              {issue.severity} Severity
            </span>
          </div>

          <p className="text-xs text-content-muted mt-2 leading-relaxed">{issue.description}</p>
        </div>

        {/* Location & GPS Info */}
        <div className="p-3.5 bg-surface-muted rounded-inner border border-border/40 space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-content">{issue.address || 'Indore Urban Road'}</p>
              {lat && lng && (
                <p className="font-mono text-[11px] text-content-muted mt-0.5">
                  GPS: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-border/30 text-[11px] text-content-subtle">
            <Calendar className="w-3.5 h-3.5 text-accent" />
            <span>Logged: {new Date(issue.detectedAt || issue.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-3 rounded-inner text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-success-soft text-success border border-success/30'
                : 'bg-danger-soft text-danger border border-danger/30'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Task Assignment Section */}
        {issue.status === 'Pending' ? (
          <div className="p-4 bg-surface rounded-inner border border-border shadow-card space-y-3">
            <div className="flex items-center gap-2">
              <HardHat className="w-4 h-4 text-accent" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-content">
                Dispatch to Field Worker
              </h3>
            </div>

            <form onSubmit={handleAssign} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-content-muted mb-1">
                  Select Field Worker
                </label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface text-content text-xs rounded-pill border border-border focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                >
                  <option value="">Choose an active worker...</option>
                  {workers.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name} ({w.assignedArea || 'Municipal Crew'}) — {w.taskCounts?.InProgress || 0} active
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-content-muted mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-surface text-content text-xs rounded-pill border border-border focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-content-muted mb-1">
                  Instructions for Crew
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Deploy cold mix asphalt patch and compact thoroughly..."
                  rows={2}
                  className="w-full px-3 py-2 bg-surface text-content text-xs rounded-inner border border-border focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={assigning}
                className="w-full py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-xs font-semibold rounded-pill shadow-card flex items-center justify-center gap-1.5 transition-all"
              >
                {assigning ? (
                  <span>Dispatching...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Assign & Dispatch Task</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-4 bg-surface-muted rounded-inner border border-border/40 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-success" />
              <span className="font-semibold text-content">Task Already Assigned</span>
            </div>
            {issue.assignedWorkerId && (
              <p className="text-content-muted">
                Worker:{' '}
                <strong className="text-content">
                  {typeof issue.assignedWorkerId === 'object'
                    ? issue.assignedWorkerId.name
                    : 'Field Responder'}
                </strong>
              </p>
            )}
            <p className="text-[11px] text-content-subtle">
              Status:{' '}
              <span className="font-semibold uppercase text-accent">{issue.status}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
