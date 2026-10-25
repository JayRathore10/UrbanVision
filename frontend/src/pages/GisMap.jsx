import React from 'react';
import dummyData from '../data/dummyData.json';
import { MapPin, Layers, Filter, Compass, AlertCircle } from 'lucide-react';

export default function GisMap() {
  const { issues, systemInfo } = dummyData;

  return (
    <div className="space-y-6">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-surface rounded-card shadow-card border border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-pill bg-accent-soft text-accent">
              GIS Subsystem
            </span>
            <span className="text-xs text-content-muted">{systemInfo?.city}</span>
          </div>
          <h1 className="text-2xl font-semibold text-content mt-2 tracking-tight">
            Geographic Information System (GIS) Map
          </h1>
          <p className="text-sm text-content-muted mt-1">
            Spatial monitoring & cluster visualization for civic anomalies.
          </p>
        </div>

        {/* Filter Badges Placeholder */}
        <div className="flex items-center gap-2 flex-wrap">
          <button className="px-3 py-1.5 bg-surface text-content text-xs font-medium rounded-pill border border-border shadow-sm flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-accent" />
            <span>All Categories ({issues?.length || 0})</span>
          </button>
          <span className="px-3 py-1.5 bg-danger-soft text-danger text-xs font-medium rounded-pill">
            🔴 Potholes ({issues?.filter((i) => i.type === 'pothole').length || 0})
          </span>
          <span className="px-3 py-1.5 bg-warning-soft text-warning text-xs font-medium rounded-pill">
            🟠 Garbage ({issues?.filter((i) => i.type === 'garbage').length || 0})
          </span>
        </div>
      </div>

      {/* Map Canvas Placeholder Card */}
      <div className="relative w-full h-[480px] bg-surface-muted rounded-card shadow-card border border-border/60 overflow-hidden flex flex-col items-center justify-center p-8 text-center">
        {/* Subtle decorative grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#4F8FE0_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative z-10 max-w-md space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent-soft flex items-center justify-center shadow-sm">
            <Compass className="w-8 h-8 text-accent animate-spin-slow" />
          </div>
          <h2 className="text-lg font-semibold text-content">
            Leaflet GIS Map Mounting in Phase 2
          </h2>
          <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
            The Leaflet and React-Leaflet packages are installed and configured. In Phase 2, interactive OpenStreetMap tiles with custom HTML animated pulsing markers and the slide-over inspection drawer will be rendered here.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface text-content text-xs font-medium rounded-pill shadow-card border border-border">
            <MapPin className="w-4 h-4 text-accent" />
            <span>Center: 22.7196° N, 75.8577° E (Indore Urban Center)</span>
          </div>
        </div>
      </div>

      {/* GeoJSON Data Preview */}
      <div className="p-6 bg-surface rounded-card shadow-card border border-border/50">
        <h3 className="text-sm font-semibold text-content mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          Mock GeoJSON Layer Feed ({issues?.length || 0} Points Loaded)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {issues?.slice(0, 3).map((issue) => (
            <div
              key={issue.id}
              className="p-3 bg-surface-muted rounded-inner border border-border/40 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-content capitalize">
                  {issue.type}
                </span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-pill uppercase ${
                    issue.status === 'resolved'
                      ? 'bg-success-soft text-success'
                      : issue.status === 'assigned'
                      ? 'bg-warning-soft text-warning'
                      : 'bg-danger-soft text-danger'
                  }`}
                >
                  {issue.status}
                </span>
              </div>
              <p className="text-xs text-content-muted line-clamp-1">{issue.title}</p>
              <p className="text-[11px] font-mono text-content-subtle">
                [{issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}]
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
