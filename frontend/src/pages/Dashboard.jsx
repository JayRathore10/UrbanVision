import React from 'react';
import dummyData from '../data/dummyData.json';
import { 
  Activity, 
  AlertTriangle, 
  Trash2, 
  CheckCircle2, 
  Truck, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { analytics, issues, workers, systemInfo } = dummyData;

  return (
    <div className="space-y-6">
      {/* Top Banner / City Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-surface rounded-card shadow-card border border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-pill bg-accent-soft text-accent">
              Phase 1 Active
            </span>
            <span className="text-xs text-content-muted">
              {systemInfo?.city || 'Municipal Smart Monitoring'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-content mt-2 tracking-tight">
            City Surveillance & Operations Dashboard
          </h1>
          <p className="text-sm text-content-muted mt-1">
            Real-time automated issue detection stream ingested from municipal sanitation fleet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/map"
            className="flex items-center gap-2 px-5 py-2.5 bg-inverse text-inverse-text text-sm font-medium rounded-pill shadow-card hover:opacity-90 transition-opacity"
          >
            <span>Open GIS Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* City Health Score */}
        <div className="p-6 bg-surface rounded-card shadow-card border border-border/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-content-muted uppercase tracking-wider">
              City Health Score
            </span>
            <div className="w-8 h-8 rounded-full bg-success-soft flex items-center justify-center">
              <Activity className="w-4 h-4 text-success" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight text-content tabular-nums">
              {analytics?.cityHealthScore ?? 94}
            </span>
            <span className="text-xs font-medium text-success bg-success-soft px-2 py-0.5 rounded-pill">
              {analytics?.cityHealthDelta || '+3.2%'}
            </span>
          </div>
          <p className="text-xs text-content-subtle mt-2">
            Weighted composite index for road quality & cleanliness
          </p>
        </div>

        {/* Potholes Detected */}
        <div className="p-6 bg-surface rounded-card shadow-card border border-border/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-content-muted uppercase tracking-wider">
              Potholes Detected
            </span>
            <div className="w-8 h-8 rounded-full bg-danger-soft flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-danger" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight text-content tabular-nums">
              {analytics?.potholesCount ?? 94}
            </span>
            <span className="text-xs text-content-muted">Total logged</span>
          </div>
          <p className="text-xs text-content-subtle mt-2">
            Edge-vision automatic detection with GPS tag
          </p>
        </div>

        {/* Waste & Garbage Points */}
        <div className="p-6 bg-surface rounded-card shadow-card border border-border/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-content-muted uppercase tracking-wider">
              Garbage Dumps
            </span>
            <div className="w-8 h-8 rounded-full bg-warning-soft flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-warning" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight text-content tabular-nums">
              {analytics?.garbageCount ?? 68}
            </span>
            <span className="text-xs text-content-muted">Spots identified</span>
          </div>
          <p className="text-xs text-content-subtle mt-2">
            Deduplicated through spatial clustering
          </p>
        </div>

        {/* Fleet Active */}
        <div className="p-6 bg-surface rounded-card shadow-card border border-border/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-content-muted uppercase tracking-wider">
              Active Edge Fleet
            </span>
            <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center">
              <Truck className="w-4 h-4 text-accent" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight text-content tabular-nums">
              {analytics?.activeVehiclesCount ?? 16}
            </span>
            <span className="text-xs text-success font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block"></span>
              Live Online
            </span>
          </div>
          <p className="text-xs text-content-subtle mt-2">
            Garbage trucks transmitting live coordinates
          </p>
        </div>
      </div>

      {/* Phase Roadmap Preview Card */}
      <div className="p-6 bg-surface rounded-card shadow-card border border-border/40">
        <h2 className="text-lg font-semibold text-content mb-2">
          Phase 1 Foundation Ready — Upcoming Bento Modules (Phase 2)
        </h2>
        <p className="text-sm text-content-muted mb-4">
          The Phase 1 shell, dark/light theme tokens, navigation system, and mock data layer are fully wired. In Phase 2, the 12-column Bento Grid with Recharts pill-bars, recent detections feed, and interactive GIS Leaflet maps will be mounted here.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-surface-muted rounded-inner border border-border/30">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider block mb-1">
              Phase 2.1 & 2.2
            </span>
            <h3 className="text-sm font-semibold text-content mb-1">Bento Grid & Recharts</h3>
            <p className="text-xs text-content-muted">
              Pill bar charts for weekly resolution stats and city health score indicators.
            </p>
          </div>

          <div className="p-4 bg-surface-muted rounded-inner border border-border/30">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider block mb-1">
              Phase 2.3 & 2.4
            </span>
            <h3 className="text-sm font-semibold text-content mb-1">Leaflet GIS Map & Drawer</h3>
            <p className="text-xs text-content-muted">
              Color-coded pulsating pins, category filters, and dispatch slide-over drawer.
            </p>
          </div>

          <div className="p-4 bg-surface-muted rounded-inner border border-border/30">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider block mb-1">
              Phase 3 & 4
            </span>
            <h3 className="text-sm font-semibold text-content mb-1">Worker App & Edge Simulator</h3>
            <p className="text-xs text-content-muted">
              Mobile photo upload resolution flow and real-time dashcam edge broadcaster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
