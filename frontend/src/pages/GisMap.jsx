import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Layers, Filter, AlertTriangle, Trash2, CheckCircle2,
  X, Send, Clock, ShieldAlert, Phone,
  Droplets, RefreshCw, Eye, Camera, Check, MapPin
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import issueService from '../services/issueService';
import taskService from '../services/taskService';
import dummyData from '../data/dummyData.json';

// Fix Leaflet default icon path issues
delete L.Icon.Default.prototype._getIconUrl;

const createMarkerIcon = (color, pulse = false) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
        ${pulse ? `<span style="position:absolute;width:32px;height:32px;border-radius:50%;background:${color};opacity:0.35;" class="animate-ping"></span>` : ''}
        <span style="width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:block;position:relative;z-index:2;"></span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const MARKER_ICONS = {
  pending: createMarkerIcon('#EF5B5B', true),
  assigned: createMarkerIcon('#F5B83D', true),
  resolved: createMarkerIcon('#22C58B', false),
  default: createMarkerIcon('#4F8FE0', false),
};

const INDORE_CENTER = [22.7196, 75.8577];

const FILTERS = [
  { key: 'all', label: 'All', icon: Layers },
  { key: 'pothole', label: 'Potholes', icon: AlertTriangle },
  { key: 'garbage', label: 'Garbage', icon: Trash2 },
  { key: 'drain', label: 'Drains', icon: Droplets },
  { key: 'high', label: 'High Severity', icon: ShieldAlert },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle2 },
];

function FlyToPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && !isNaN(position[0]) && !isNaN(position[1])) {
      map.flyTo(position, 15, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

function MapController({ onMapReady }) {
  const map = useMap();
  useEffect(() => {
    if (onMapReady) onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

export default function GisMap() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const [dispatching, setDispatching] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [usingMock, setUsingMock] = useState(false);
  const mapRef = useRef(null);
  const toast = useToast();

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const data = await issueService.getIssues();
      const list = data?.issues || data?.data || (Array.isArray(data) ? data : null);
      if (Array.isArray(list) && list.length > 0) {
        setIssues(list);
        setUsingMock(false);
      } else {
        throw new Error('No issues from backend');
      }
    } catch {
      setIssues(dummyData.issues);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Listen to simulator broadcast events to add new issues to map and fly to them
  useEffect(() => {
    const handleNewDetection = (event) => {
      const newIssue = event.detail;
      if (newIssue) {
        setIssues((prev) => [newIssue, ...prev]);
        const pos = getLatLng(newIssue);
        if (pos) setFlyTarget(pos);
      }
    };
    window.addEventListener('urbanvision:new-detection', handleNewDetection);
    return () => window.removeEventListener('urbanvision:new-detection', handleNewDetection);
  }, []);

  const getLatLng = (issue) => {
    if (issue?.location?.lat && issue?.location?.lng) {
      return [Number(issue.location.lat), Number(issue.location.lng)];
    }
    if (issue?.location?.coordinates && Array.isArray(issue.location.coordinates)) {
      // GeoJSON format: [longitude, latitude]
      return [Number(issue.location.coordinates[1]), Number(issue.location.coordinates[0])];
    }
    return null;
  };

  const filteredIssues = useMemo(() => {
    if (activeFilter === 'all') return issues;
    if (activeFilter === 'high') return issues.filter((i) => i.severity === 'high');
    if (activeFilter === 'resolved') return issues.filter((i) => i.status === 'resolved');
    return issues.filter((i) => i.type === activeFilter);
  }, [issues, activeFilter]);

  const handleMarkerSelect = (issue) => {
    setSelectedIssue(issue);
    setDrawerOpen(true);
    const pos = getLatLng(issue);
    if (pos) setFlyTarget(pos);
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorker || !selectedIssue) return;
    setDispatching(true);
    try {
      const issueId = selectedIssue._id || selectedIssue.id;
      await taskService.assignTask(issueId, selectedWorker);
      toast.success('Task successfully dispatched to worker!');
      setIssues((prev) =>
        prev.map((item) =>
          (item._id || item.id) === issueId
            ? { ...item, status: 'assigned', assignedWorkerId: selectedWorker }
            : item
        )
      );
      if (selectedIssue) {
        setSelectedIssue((prev) => ({ ...prev, status: 'assigned', assignedWorkerId: selectedWorker }));
      }
      setDispatchOpen(false);
    } catch (err) {
      // Local optimistic update for demo resilience if backend call fails
      const issueId = selectedIssue._id || selectedIssue.id;
      setIssues((prev) =>
        prev.map((item) =>
          (item._id || item.id) === issueId
            ? { ...item, status: 'assigned', assignedWorkerId: selectedWorker }
            : item
        )
      );
      toast.warning('Assigned in demo mode (Backend response: ' + (err.response?.data?.message || err.message) + ')');
      setDispatchOpen(false);
    } finally {
      setDispatching(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    if (status === 'resolved') return 'success';
    if (status === 'assigned') return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-surface rounded-card shadow-card border border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="accent">GIS Subsystem</Badge>
            <span className="text-xs text-content-muted">{dummyData.systemInfo?.city}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-content mt-1.5 tracking-tight">
            Geographic Information System (GIS) Map
          </h1>
          <p className="text-sm text-content-muted">
            Live geospatial cluster visualization with dynamic dispatch capabilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchIssues}
            className="flex items-center gap-2 px-4 py-2 bg-surface text-content text-xs font-medium rounded-pill border border-border hover:bg-surface-hover shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-accent" />
            <span>Sync Live Map</span>
          </button>
        </div>
      </div>

      {usingMock && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-warning-soft border border-warning/30 rounded-inner text-xs text-warning">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Backend sync offline. Operating with static GeoJSON dataset.</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const Icon = f.icon;
          const count =
            f.key === 'all'
              ? issues.length
              : f.key === 'high'
              ? issues.filter((i) => i.severity === 'high').length
              : f.key === 'resolved'
              ? issues.filter((i) => i.status === 'resolved').length
              : issues.filter((i) => i.type === f.key).length;
          const isActive = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-pill text-xs font-medium border transition-all ${
                isActive
                  ? 'bg-accent text-accent-contrast border-accent shadow-sm'
                  : 'bg-surface text-content-muted border-border hover:text-content hover:bg-surface-hover'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{f.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-surface-muted text-content-subtle'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Map + Drawer Layout */}
      <div className="relative w-full h-[580px] bg-surface rounded-card shadow-card border border-border/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" text="Initializing Leaflet GIS Canvas..." />
          </div>
        ) : (
          <MapContainer
            center={INDORE_CENTER}
            zoom={13}
            scrollWheelZoom={true}
            className="w-full h-full z-0"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <MapController onMapReady={(m) => { mapRef.current = m; }} />
            {flyTarget && <FlyToPosition position={flyTarget} />}

            {filteredIssues.map((issue) => {
              const pos = getLatLng(issue);
              if (!pos || isNaN(pos[0]) || isNaN(pos[1])) return null;
              const icon = MARKER_ICONS[issue.status] || MARKER_ICONS.default;

              return (
                <Marker
                  key={issue._id || issue.id}
                  position={pos}
                  icon={icon}
                  eventHandlers={{
                    click: () => handleMarkerSelect(issue),
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-1 text-xs">
                      <div className="font-semibold text-content">{issue.title}</div>
                      <div className="text-[11px] text-content-muted">{issue.location?.address}</div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="capitalize font-medium text-accent">{issue.type}</span>
                        <span>•</span>
                        <span className="uppercase text-[10px] font-semibold">{issue.severity}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

        {/* Floating Map Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-surface/90 backdrop-blur-md border border-border rounded-inner p-3 shadow-card text-xs space-y-1.5 hidden sm:block">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-content-subtle">Marker Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-danger animate-pulse" />
            <span className="text-content">Pending Issue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-content">Assigned / In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success" />
            <span className="text-content">Resolved & Verified</span>
          </div>
        </div>

        {/* Slide-over Issue Details Drawer */}
        {drawerOpen && selectedIssue && (
          <div className="absolute top-0 right-0 h-full w-full sm:w-[420px] bg-surface/95 backdrop-blur-lg border-l border-border shadow-2xl z-20 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant={getStatusBadgeVariant(selectedIssue.status)}>
                    {selectedIssue.status}
                  </Badge>
                  <h2 className="text-lg font-semibold text-content mt-1">{selectedIssue.title}</h2>
                  <p className="text-xs font-mono text-content-subtle">{selectedIssue.id || selectedIssue._id}</p>
                </div>
                <button
                  onClick={() => { setDrawerOpen(false); setSelectedIssue(null); }}
                  className="p-1 text-content-muted hover:text-content hover:bg-surface-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Photo Evidence */}
              {selectedIssue.imageUrl && (
                <div className="rounded-inner overflow-hidden border border-border/50 relative">
                  <img
                    src={selectedIssue.imageUrl}
                    alt={selectedIssue.title}
                    className="w-full h-44 object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] bg-inverse/80 text-inverse-text rounded-pill font-mono">
                    Edge Cam Capture
                  </span>
                </div>
              )}

              {/* Resolved Comparison */}
              {selectedIssue.status === 'resolved' && selectedIssue.resolvedImageUrl && (
                <div className="p-3 bg-success-soft/30 rounded-inner border border-success/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-success">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Resolution Verification Photo</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-content-muted block mb-1">Before Repair</span>
                      <img src={selectedIssue.imageUrl} alt="Before" className="w-full h-20 object-cover rounded-md" />
                    </div>
                    <div>
                      <span className="text-[10px] text-success font-medium block mb-1">After Repair</span>
                      <img src={selectedIssue.resolvedImageUrl} alt="After" className="w-full h-20 object-cover rounded-md" />
                    </div>
                  </div>
                </div>
              )}

              {/* Specs */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-surface-muted rounded-inner">
                  <span className="text-[10px] font-semibold text-content-subtle uppercase">Description</span>
                  <p className="text-content mt-0.5">{selectedIssue.description || 'No detailed description provided.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-surface-muted rounded-inner">
                    <span className="text-[10px] font-semibold text-content-subtle uppercase">Category</span>
                    <p className="font-semibold text-content capitalize mt-0.5">{selectedIssue.type}</p>
                  </div>
                  <div className="p-3 bg-surface-muted rounded-inner">
                    <span className="text-[10px] font-semibold text-content-subtle uppercase">Severity</span>
                    <Badge variant={selectedIssue.severity === 'high' ? 'danger' : 'warning'} className="mt-1">
                      {selectedIssue.severity}
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-surface-muted rounded-inner">
                  <span className="text-[10px] font-semibold text-content-subtle uppercase">Location Coordinates</span>
                  <p className="text-content mt-0.5 font-medium">{selectedIssue.location?.address}</p>
                  <p className="text-[11px] font-mono text-content-subtle mt-1">
                    Lat: {getLatLng(selectedIssue)?.[0]?.toFixed(5)}, Lng: {getLatLng(selectedIssue)?.[1]?.toFixed(5)}
                  </p>
                </div>

                {selectedIssue.assignedWorker && (
                  <div className="p-3 bg-accent-soft/40 rounded-inner border border-accent/20">
                    <span className="text-[10px] font-semibold text-accent uppercase">Assigned Field Crew</span>
                    <p className="text-sm font-medium text-content mt-0.5">{selectedIssue.assignedWorker.name}</p>
                    {selectedIssue.assignedWorker.phone && (
                      <p className="text-xs text-content-muted flex items-center gap-1 mt-1">
                        <Phone className="w-3.5 h-3.5 text-accent" />
                        {selectedIssue.assignedWorker.phone}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              {selectedIssue.status !== 'resolved' && (
                <button
                  onClick={() => setDispatchOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-inverse text-inverse-text text-sm font-medium rounded-pill shadow-card hover:opacity-90 active:scale-98 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{selectedIssue.status === 'assigned' ? 'Reassign Field Worker' : 'Dispatch Worker Task'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Task Dispatch Modal */}
      {dispatchOpen && selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface border border-border rounded-card p-6 max-w-md w-full shadow-card relative">
            <button
              onClick={() => setDispatchOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-content-muted hover:text-content rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-inner bg-accent-soft flex items-center justify-center">
                <Send className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-content">Dispatch Task Order</h3>
                <p className="text-xs text-content-muted truncate max-w-[280px]">{selectedIssue.title}</p>
              </div>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-muted uppercase mb-1.5">
                  Designate Field Worker
                </label>
                <select
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-surface-muted text-content text-sm rounded-pill border border-border focus:ring-2 focus:ring-accent outline-none"
                >
                  <option value="">Select an active worker...</option>
                  {dummyData.workers.map((w) => (
                    <option key={w.id} value={w._id || w.id}>
                      {w.name} — {w.zone} ({w.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-surface-muted rounded-inner text-xs text-content-muted space-y-1">
                <div className="flex justify-between">
                  <span>Priority Level:</span>
                  <span className="font-semibold text-danger uppercase">{selectedIssue.severity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Zone:</span>
                  <span className="text-content font-medium">{selectedIssue.location?.address?.split(',')[0]}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDispatchOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-content bg-surface-muted hover:bg-surface-hover rounded-pill border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatching || !selectedWorker}
                  className="px-5 py-2 text-xs font-semibold bg-inverse text-inverse-text rounded-pill hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
                >
                  {dispatching ? 'Assigning...' : 'Confirm Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
