import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, 
  Layers, 
  Filter, 
  AlertTriangle, 
  Trash2, 
  Droplets, 
  RefreshCw, 
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import LeafletMap from '../components/map/LeafletMap';
import IssueDrawer from '../components/map/IssueDrawer';

export default function GisMap() {
  const [issues, setIssues] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Load issues and supervisors from backend
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [issuesRes, supRes] = await Promise.allSettled([
        api.issues.getMap(),
        api.supervisors.list(),
      ]);

      if (issuesRes.status === 'fulfilled') {
        const val = issuesRes.value;
        if (Array.isArray(val?.data?.issues)) {
          setIssues(val.data.issues);
        } else if (Array.isArray(val?.issues)) {
          setIssues(val.issues);
        } else if (Array.isArray(val?.features)) {
          const mapped = val.features.map((f) => ({
            _id: f.properties?.issueId || f.id || f._id,
            ...f.properties,
            location: f.geometry,
          }));
          setIssues(mapped);
        } else if (Array.isArray(val?.data?.features)) {
          const mapped = val.data.features.map((f) => ({
            _id: f.properties?.issueId || f.id || f._id,
            ...f.properties,
            location: f.geometry,
          }));
          setIssues(mapped);
        }
      } else if (issuesRes.status === 'rejected') {
        console.error('[GisMap] Failed to load issues:', issuesRes.reason);
        setError('Failed to connect to the municipal map server. Please verify backend is running.');
      }

      if (supRes.status === 'fulfilled' && supRes.value.data?.supervisors) {
        setSupervisors(supRes.value.data.supervisors);
      }
    } catch (err) {
      console.error('[GisMap] Error fetching data:', err);
      setError(err.message || 'An unexpected error occurred while loading map data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client-side filtering for fast interactive responsiveness
  const filteredIssues = issues.filter((issue) => {
    // Category match
    if (categoryFilter === 'POTHOLE') {
      if (issue.type !== 'Pothole' && issue.type !== 'RoadDamage') return false;
    } else if (categoryFilter === 'GARBAGE') {
      if (issue.type !== 'Garbage' && issue.type !== 'GarbageOverflow') return false;
    } else if (categoryFilter === 'DRAINAGE') {
      if (issue.type !== 'BlockedDrain' && issue.type !== 'SewageOverflow') return false;
    }

    // Severity match
    if (severityFilter !== 'ALL' && issue.severity !== severityFilter) {
      return false;
    }

    // Status match
    if (statusFilter !== 'ALL' && issue.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Calculate quick metrics
  const totalCount = issues.length;
  const potholeCount = issues.filter((i) => i.type === 'Pothole' || i.type === 'RoadDamage').length;
  const garbageCount = issues.filter((i) => i.type === 'Garbage' || i.type === 'GarbageOverflow').length;
  const drainageCount = issues.filter((i) => i.type === 'BlockedDrain' || i.type === 'SewageOverflow').length;
  const criticalCount = issues.filter((i) => i.severity === 'Critical').length;
  const resolvedCount = issues.filter((i) => i.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-surface rounded-card shadow-card border border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-pill bg-accent-soft text-accent flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping"></span>
              Live GIS Subsystem
            </span>
            <span className="text-xs text-content-muted">Indore Smart City Grid (Zone 1 & 2)</span>
          </div>
          <h1 className="text-2xl font-semibold text-content mt-2 tracking-tight">
            Geographic Incident Command Map
          </h1>
          <p className="text-sm text-content-muted mt-1">
            Real-time geospatial visualization of road anomalies, truck dashcam feeds & field units.
          </p>
        </div>

        {/* Quick Stats Badges & Refresh */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-surface-muted px-3 py-1.5 rounded-pill border border-border/50 text-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-danger" />
            <span className="font-semibold text-content">{criticalCount}</span>
            <span className="text-content-muted">Critical</span>
          </div>
          <div className="flex items-center gap-2 bg-surface-muted px-3 py-1.5 rounded-pill border border-border/50 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            <span className="font-semibold text-content">{resolvedCount}</span>
            <span className="text-content-muted">Resolved</span>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface text-content text-xs font-medium rounded-pill border border-border shadow-sm hover:bg-surface-hover active:scale-95 transition-all"
            title="Refresh map points"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-accent ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 bg-surface rounded-card shadow-card border border-border/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-content-muted uppercase tracking-wider mr-1 hidden sm:inline">
            Category:
          </span>
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-pill transition-all ${
              categoryFilter === 'ALL'
                ? 'bg-accent text-white shadow-sm'
                : 'bg-surface-muted text-content-muted hover:text-content hover:bg-surface-hover'
            }`}
          >
            All Categories ({totalCount})
          </button>
          <button
            onClick={() => setCategoryFilter('POTHOLE')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-pill transition-all ${
              categoryFilter === 'POTHOLE'
                ? 'bg-danger text-white shadow-sm'
                : 'bg-surface-muted text-content-muted hover:text-danger hover:bg-danger/10'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Potholes ({potholeCount})</span>
          </button>
          <button
            onClick={() => setCategoryFilter('GARBAGE')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-pill transition-all ${
              categoryFilter === 'GARBAGE'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-surface-muted text-content-muted hover:text-amber-600 hover:bg-amber-500/10'
            }`}
          >
            <Trash2 className="w-3 h-3" />
            <span>Garbage ({garbageCount})</span>
          </button>
          <button
            onClick={() => setCategoryFilter('DRAINAGE')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-pill transition-all ${
              categoryFilter === 'DRAINAGE'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-surface-muted text-content-muted hover:text-cyan-600 hover:bg-cyan-500/10'
            }`}
          >
            <Droplets className="w-3 h-3" />
            <span>Drainage ({drainageCount})</span>
          </button>
        </div>

        {/* Severity & Status Select Dropdowns */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-content-muted font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs bg-surface-muted border border-border rounded-pill px-3 py-1.5 text-content focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-content-muted font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-surface-muted border border-border rounded-pill px-3 py-1.5 text-content focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="ALL">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Assigned">Assigned</option>
              <option value="InProgress">In Progress</option>
              <option value="UnderReview">Under Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-danger-soft border border-danger/30 rounded-inner text-xs text-danger flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="px-3 py-1 bg-danger text-white rounded-pill font-medium hover:opacity-90"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Interactive Map Canvas */}
      <div className="relative rounded-card overflow-hidden shadow-card border border-border/70 bg-surface">
        {loading && (
          <div className="absolute inset-0 z-20 bg-surface/70 backdrop-blur-[2px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 p-4 bg-surface rounded-inner shadow-card border border-border">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
              <span className="text-xs font-medium text-content">Loading live spatial nodes...</span>
            </div>
          </div>
        )}

        <LeafletMap
          issues={filteredIssues}
          supervisors={supervisors}
          onSelectIssue={(issue) => setSelectedIssue(issue)}
          className="h-[580px] w-full"
        />

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-10 bg-surface/95 backdrop-blur-md border border-border/60 rounded-inner p-3 shadow-card text-xs space-y-1.5 hidden sm:block">
          <div className="font-semibold text-content text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-accent" />
            Map Legend
          </div>
          <div className="flex items-center gap-2 text-content-muted">
            <span className="w-3 h-3 rounded-full bg-danger inline-block ring-2 ring-danger/20"></span>
            <span>Pothole / Road Damage (Pulsing = Critical)</span>
          </div>
          <div className="flex items-center gap-2 text-content-muted">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block ring-2 ring-amber-500/20"></span>
            <span>Garbage / Bin Overflow</span>
          </div>
          <div className="flex items-center gap-2 text-content-muted">
            <span className="w-3 h-3 rounded-full bg-cyan-600 inline-block ring-2 ring-cyan-600/20"></span>
            <span>Sewage / Storm Drain Anomaly</span>
          </div>
          <div className="flex items-center gap-2 text-content-muted">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-500/20"></span>
            <span>Resolved Maintenance Issue</span>
          </div>
          <div className="flex items-center gap-2 text-content-muted">
            <span className="w-3 h-3 rounded-full bg-accent inline-block ring-2 ring-accent/30"></span>
            <span>Supervisor Command Post (HQ)</span>
          </div>
        </div>
      </div>

      {/* Slide-over Inspection & Worker Dispatch Drawer */}
      {selectedIssue && (
        <IssueDrawer
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onIssueUpdated={() => {
            fetchData();
          }}
        />
      )}
    </div>
  );
}
