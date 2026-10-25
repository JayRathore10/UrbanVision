import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TopNav from './components/layout/TopNav';
import Dashboard from './pages/Dashboard';
import GisMap from './pages/GisMap';
import WorkerView from './pages/WorkerView';
import Supervisors from './pages/Supervisors';

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-content flex flex-col font-sans transition-colors duration-200">
      {/* App Shell Sticky Top Navigation */}
      <TopNav />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<GisMap />} />
          <Route path="/supervisors" element={<Supervisors />} />
          <Route path="/supervisors/:id" element={<Supervisors />} />
          <Route path="/worker" element={<WorkerView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-4 text-center text-xs text-content-muted">
        <div className="max-w-[1440px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>UrbanVision © 2026 — AI-Powered Smart Municipal Monitoring System</span>
          <span className="font-mono text-[11px] text-content-subtle">
            Indore Municipal Corporation • All Phases Integrated
          </span>
        </div>
      </footer>
    </div>
  );
}
