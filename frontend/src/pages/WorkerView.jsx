import React from 'react';
import dummyData from '../data/dummyData.json';
import { HardHat, CheckCircle2, Clock, Camera, User, Phone, MapPin } from 'lucide-react';

export default function WorkerView() {
  const { workers, issues } = dummyData;
  const sampleWorker = workers[0] || {};
  const assignedTasks = issues.filter((i) => i.assignedWorkerId === sampleWorker.id || i.status === 'assigned');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Worker Profile Header Card */}
      <div className="p-6 bg-surface rounded-card shadow-card border border-border/50">
        <div className="flex items-center gap-4">
          <img
            src={sampleWorker.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
            alt={sampleWorker.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-accent/30"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-content truncate">
                {sampleWorker.name || 'Field Lead'}
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-success-soft text-success rounded-pill uppercase">
                {sampleWorker.status || 'Active'}
              </span>
            </div>
            <p className="text-xs text-content-muted flex items-center gap-1 mt-0.5">
              <HardHat className="w-3.5 h-3.5 text-accent" />
              <span>{sampleWorker.role || 'Municipal Responder'}</span>
              <span>•</span>
              <span>{sampleWorker.zone || 'Zone 4'}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/40">
          <div className="p-3 bg-surface-muted rounded-inner text-center">
            <span className="text-xl font-semibold text-content tabular-nums">
              {sampleWorker.tasksAssigned ?? assignedTasks.length}
            </span>
            <span className="block text-[11px] text-content-muted mt-0.5">Assigned Tasks</span>
          </div>
          <div className="p-3 bg-surface-muted rounded-inner text-center">
            <span className="text-xl font-semibold text-success tabular-nums">
              {sampleWorker.tasksCompleted ?? 34}
            </span>
            <span className="block text-[11px] text-content-muted mt-0.5">Resolved Total</span>
          </div>
        </div>
      </div>

      {/* Task Queue Section */}
      <div className="p-6 bg-surface rounded-card shadow-card border border-border/50 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-content flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <span>Assigned Tasks Queue (Phase 3 Interface)</span>
          </h2>
          <span className="text-xs text-content-muted">
            {assignedTasks.length} pending action
          </span>
        </div>

        {assignedTasks.length === 0 ? (
          <p className="text-xs text-content-muted">No pending tasks assigned.</p>
        ) : (
          <div className="space-y-3">
            {assignedTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-surface-muted rounded-inner border border-border/40 space-y-2 hover:border-accent/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-pill bg-warning-soft text-warning">
                      {task.type}
                    </span>
                    <span className="text-xs font-semibold text-content">{task.id}</span>
                  </div>
                  <span className="text-[10px] font-medium text-danger bg-danger-soft px-2 py-0.5 rounded-pill uppercase">
                    {task.severity}
                  </span>
                </div>

                <p className="text-xs font-medium text-content">{task.title}</p>

                <p className="text-xs text-content-muted flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span className="truncate">{task.location?.address}</span>
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-border/30">
                  <span className="text-[11px] text-content-subtle">
                    Phase 3: Camera photo resolution upload
                  </span>
                  <button
                    disabled
                    className="flex items-center gap-1.5 px-3 py-1 bg-surface text-content text-xs font-medium rounded-pill border border-border opacity-70 cursor-not-allowed"
                  >
                    <Camera className="w-3.5 h-3.5 text-accent" />
                    <span>Upload Proof</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
