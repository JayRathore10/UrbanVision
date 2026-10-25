import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, Trash2, Droplets, Shield, ExternalLink, Calendar, MapPin } from 'lucide-react';

// Controller to auto-fit map view to markers
function MapBoundsController({ markers, selectedMarker }) {
  const map = useMap();

  useEffect(() => {
    if (selectedMarker && selectedMarker.coordinates) {
      const [lat, lng] = selectedMarker.coordinates;
      map.flyTo([lat, lng], 16, { duration: 1.2 });
    } else if (markers && markers.length > 0) {
      const validCoords = markers
        .map((m) => m.coordinates)
        .filter((c) => Array.isArray(c) && c.length === 2 && !isNaN(c[0]) && !isNaN(c[1]));

      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [markers, selectedMarker, map]);

  return null;
}

// Generate custom animated Leaflet DivIcon
const createCustomMarkerIcon = (type, severity, status, isSupervisor = false) => {
  if (isSupervisor) {
    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
          <div class="absolute w-10 h-10 rounded-full bg-accent/20 animate-ping"></div>
          <div class="relative w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-accent/30 transition-transform group-hover:scale-110">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }

  // Color mapping based on type & severity
  let bgClass = 'bg-danger text-white ring-danger/30';
  let pulseColor = 'bg-danger/25';
  let iconSvg = '<circle cx="12" cy="12" r="8"/>';

  if (type === 'Pothole' || type === 'RoadDamage') {
    bgClass = severity === 'Critical' ? 'bg-red-600 text-white ring-red-400' : 'bg-rose-500 text-white ring-rose-300';
    pulseColor = 'bg-rose-400/30';
    iconSvg = '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>';
  } else if (type === 'Garbage' || type === 'GarbageOverflow') {
    bgClass = 'bg-amber-500 text-white ring-amber-300';
    pulseColor = 'bg-amber-400/30';
    iconSvg = '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>';
  } else if (type === 'BlockedDrain' || type === 'SewageOverflow') {
    bgClass = severity === 'Critical' ? 'bg-blue-600 text-white ring-blue-400' : 'bg-cyan-500 text-white ring-cyan-300';
    pulseColor = 'bg-cyan-400/30';
    iconSvg = '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>';
  }

  if (status === 'Resolved') {
    bgClass = 'bg-emerald-500 text-white ring-emerald-300';
    pulseColor = 'bg-emerald-400/20';
    iconSvg = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>';
  }

  const isPulsing = status !== 'Resolved' && (severity === 'Critical' || severity === 'High');

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
        ${isPulsing ? `<div class="absolute w-8 h-8 rounded-full ${pulseColor} animate-ping"></div>` : ''}
        <div class="relative w-7 h-7 rounded-full ${bgClass} flex items-center justify-center shadow-md border-2 border-white ring-2 transition-transform duration-200 group-hover:scale-125">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            ${iconSvg}
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export default function LeafletMap({
  issues = [],
  supervisors = [],
  onSelectIssue,
  onSelectSupervisor,
  selectedLocation,
  className = 'h-[540px]',
}) {
  // Center of Indore, Madhya Pradesh
  const defaultCenter = [22.7196, 75.8577];

  // Process issues into coordinate markers (GeoJSON stores [lng, lat], Leaflet requires [lat, lng])
  const issueMarkers = issues
    .map((issue) => {
      let coords = null;
      if (issue.location?.coordinates && Array.isArray(issue.location.coordinates)) {
        const [lng, lat] = issue.location.coordinates;
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          coords = [lat, lng];
        }
      }
      return {
        ...issue,
        coordinates: coords,
        isSupervisor: false,
      };
    })
    .filter((m) => m.coordinates !== null);

  // Process supervisor base markers
  const supervisorMarkers = supervisors
    .map((sup) => {
      let coords = null;
      if (sup.location?.coordinates && Array.isArray(sup.location.coordinates)) {
        const [lng, lat] = sup.location.coordinates;
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          coords = [lat, lng];
        }
      }
      return {
        ...sup,
        coordinates: coords,
        isSupervisor: true,
      };
    })
    .filter((m) => m.coordinates !== null);

  const allMarkers = [...issueMarkers, ...supervisorMarkers];

  return (
    <div className={`relative w-full rounded-card overflow-hidden shadow-card border border-border/60 ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsController markers={allMarkers} selectedMarker={selectedLocation} />

        {/* Issue Markers */}
        {issueMarkers.map((issue) => {
          const icon = createCustomMarkerIcon(issue.type, issue.severity, issue.status, false);

          return (
            <Marker
              key={issue._id || issue.id || issue.issueCode}
              position={issue.coordinates}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onSelectIssue) onSelectIssue(issue);
                },
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 max-w-xs space-y-2 text-content font-sans">
                  <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1.5">
                    <span className="font-mono text-xs font-bold text-accent">{issue.issueCode}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill uppercase ${
                        issue.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : issue.status === 'InProgress' || issue.status === 'Assigned'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {issue.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-content">{issue.type}</h4>
                    <p className="text-[11px] text-content-muted line-clamp-2 mt-0.5">{issue.description}</p>
                  </div>

                  {issue.address && (
                    <div className="flex items-start gap-1 text-[11px] text-content-subtle">
                      <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="truncate">{issue.address}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[10px] text-content-muted">
                    <span>Severity: <strong className="text-content">{issue.severity}</strong></span>
                    <span>Confidence: <strong>{Math.round((issue.confidenceScore || 0.9) * 100)}%</strong></span>
                  </div>

                  <button
                    onClick={() => onSelectIssue && onSelectIssue(issue)}
                    className="w-full mt-1 px-3 py-1.5 bg-accent hover:bg-accent/90 text-white text-xs font-medium rounded-pill flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View Inspection Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Supervisor Headquarters / Zone Markers */}
        {supervisorMarkers.map((sup) => {
          const icon = createCustomMarkerIcon(null, null, null, true);

          return (
            <Marker
              key={sup._id || sup.id}
              position={sup.coordinates}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onSelectSupervisor) onSelectSupervisor(sup);
                },
              }}
            >
              <Popup>
                <div className="p-1 max-w-xs space-y-1.5 font-sans">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-content">{sup.name}</span>
                    <span className="text-[10px] bg-accent-soft text-accent px-1.5 py-0.5 rounded font-medium">Supervisor</span>
                  </div>
                  <p className="text-[11px] text-content-muted">{sup.assignedArea || 'Municipal Sector'}</p>
                  <p className="text-[11px] text-content-subtle font-mono">{sup.email}</p>
                  <button
                    onClick={() => onSelectSupervisor && onSelectSupervisor(sup)}
                    className="w-full mt-1 px-2.5 py-1 bg-surface-muted hover:bg-surface text-content border border-border text-[11px] font-medium rounded-pill flex items-center justify-center gap-1"
                  >
                    <span>Open Supervisor Workspace</span>
                    <ExternalLink className="w-3 h-3 text-accent" />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
