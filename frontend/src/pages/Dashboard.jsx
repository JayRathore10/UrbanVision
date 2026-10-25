import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Activity, AlertTriangle, Trash2, CheckCircle2, Truck, TrendingUp,
  ArrowRight, ShieldAlert, Clock, MapPin, BarChart3, PieChart as PieIcon,
  Zap, Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import MetricBlock from '../components/ui/MetricBlock';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import dashboardService from '../services/dashboardService';
import dummyData from '../data/dummyData.json';

const CHART_COLORS = [
  'var(--accent)', 'var(--danger)', 'var(--warning)', 'var(--success)',
  'var(--text-subtle)',
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-inner shadow-card p-3 text-xs">
      <p className="font-semibold text-content mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: entry.color }} />
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [byType, setByType] = useState(null);
  const [bySeverity, setBySeverity] = useState(null);
  const [trends, setTrends] = useState(null);
  const [resolution, setResolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [s, t, sv, tr, r] = await Promise.allSettled([
          dashboardService.getSummary(),
          dashboardService.getIssuesByType(),
          dashboardService.getIssuesBySeverity(),
          dashboardService.getDetectionTrends(),
          dashboardService.getResolutionMetrics(),
        ]);
        if (mounted) {
          if (s.status === 'fulfilled') setSummary(s.value);
          if (t.status === 'fulfilled') setByType(t.value);
          if (sv.status === 'fulfilled') setBySeverity(sv.value);
          if (tr.status === 'fulfilled') setTrends(tr.value);
          if (r.status === 'fulfilled') setResolution(r.value);
          // If summary failed, use mock
          if (s.status === 'rejected') {
            setUsingMock(true);
          }
        }
      } catch {
        if (mounted) setUsingMock(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  // Derive display data — use API data when available, fall back to mock
  const { analytics, issues, workers, fleet, systemInfo } = dummyData;
  const displaySummary = summary || {
    total: analytics.totalIssuesReported,
    pending: analytics.activePendingIssues,
    assigned: issues.filter(i => i.status === 'assigned').length,
    resolved: analytics.totalIssuesResolved,
  };

  const weeklyData = trends?.data || analytics.weeklyStats;
  const typeData = byType?.data || [
    { name: 'Potholes', value: analytics.potholesCount },
    { name: 'Garbage', value: analytics.garbageCount },
    { name: 'Drains', value: analytics.drainsCount },
  ];
  const severityData = bySeverity?.data || [
    { name: 'High', value: 42, color: 'var(--danger)' },
    { name: 'Medium', value: 38, color: 'var(--warning)' },
    { name: 'Low', value: 20, color: 'var(--success)' },
  ];
  const resolutionData = resolution || {
    avgResolutionHours: analytics.avgResolutionTimeHours,
    closureRate: analytics.resolutionRatePercent,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading dashboard analytics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mock Data Banner */}
      {usingMock && (
        <div className="flex items-center gap-2 px-4 py-2 bg-warning-soft border border-warning/30 rounded-inner text-xs text-warning">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Backend unavailable — displaying demo data. Connect to <code className="font-mono text-warning">VITE_API_BASE_URL</code> for live analytics.</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-surface rounded-card shadow-card border border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="accent">Live Dashboard</Badge>
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
        <Card>
          <MetricBlock
            label="Total Issues"
            value={displaySummary.total ?? analytics.totalIssuesReported}
            icon={ShieldAlert}
            iconBg="bg-accent-soft"
            iconColor="text-accent"
          />
          <p className="text-xs text-content-subtle mt-2">All detected infrastructure issues</p>
        </Card>

        <Card>
          <MetricBlock
            label="Pending"
            value={displaySummary.pending ?? analytics.activePendingIssues}
            delta={`${displaySummary.pending > 10 ? '↑' : '↓'} Active`}
            deltaVariant={displaySummary.pending > 10 ? 'warning' : 'success'}
            icon={Clock}
            iconBg="bg-danger-soft"
            iconColor="text-danger"
          />
          <p className="text-xs text-content-subtle mt-2">Awaiting dispatch or action</p>
        </Card>

        <Card>
          <MetricBlock
            label="Resolved"
            value={displaySummary.resolved ?? analytics.totalIssuesResolved}
            delta={`${resolutionData.closureRate || analytics.resolutionRatePercent}%`}
            deltaVariant="success"
            icon={CheckCircle2}
            iconBg="bg-success-soft"
            iconColor="text-success"
          />
          <p className="text-xs text-content-subtle mt-2">Successfully repaired & verified</p>
        </Card>

        <Card>
          <MetricBlock
            label="Active Fleet"
            value={analytics.activeVehiclesCount}
            icon={Truck}
            iconBg="bg-accent-soft"
            iconColor="text-accent"
          />
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-success font-medium">Live Online</span>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Weekly Bar Chart - spans 8 cols */}
        <Card className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-content">Weekly Detection & Resolution</h3>
                <p className="text-xs text-content-muted">7-day rolling trend</p>
              </div>
            </div>
            <Badge variant="accent">This Week</Badge>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyData} barGap={8}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-subtle)', fontSize: 12 }}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-muted)', radius: 8 }} />
              <Bar
                dataKey="detected"
                name="Detected"
                fill="var(--accent)"
                radius={[999, 999, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="resolved"
                name="Resolved"
                fill="var(--success)"
                radius={[999, 999, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-content-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--accent)' }} />
              Detected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--success)' }} />
              Resolved
            </span>
          </div>
        </Card>

        {/* Issues by Type Pie Chart - spans 4 cols */}
        <Card className="lg:col-span-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center">
              <PieIcon className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-content">Issues by Type</h3>
              <p className="text-xs text-content-muted">Category breakdown</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {typeData.map((entry, index) => (
              <span key={entry.name} className="flex items-center gap-1.5 text-xs text-content-muted">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                {entry.name} ({entry.value})
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Resolution Metrics */}
        <Card className="lg:col-span-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-success-soft flex items-center justify-center">
              <Zap className="w-4 h-4 text-success" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-content">Resolution Metrics</h3>
              <p className="text-xs text-content-muted">Repair performance</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-surface-muted rounded-inner text-center">
              <span className="text-2xl font-semibold text-content tabular-nums">
                {resolutionData.avgResolutionHours || analytics.avgResolutionTimeHours}h
              </span>
              <span className="block text-[11px] text-content-muted mt-1">Avg Resolution</span>
            </div>
            <div className="p-4 bg-surface-muted rounded-inner text-center">
              <span className="text-2xl font-semibold text-success tabular-nums">
                {resolutionData.closureRate || analytics.resolutionRatePercent}%
              </span>
              <span className="block text-[11px] text-content-muted mt-1">Closure Rate</span>
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="mt-4 pt-4 border-t border-border/40">
            <h4 className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-3">
              By Severity
            </h4>
            <div className="space-y-2">
              {severityData.map((item) => {
                const total = severityData.reduce((s, i) => s + i.value, 0);
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="text-xs text-content-muted w-12">{item.name}</span>
                    <div className="flex-1 h-2 bg-surface-muted rounded-pill overflow-hidden">
                      <div
                        className="h-full rounded-pill transition-all duration-500"
                        style={{ width: `${pct}%`, background: item.color || 'var(--accent)' }}
                      />
                    </div>
                    <span className="text-xs font-medium text-content tabular-nums w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Recent Detections List */}
        <Card className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-danger-soft flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-danger" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-content">Recent Detections</h3>
                <p className="text-xs text-content-muted">Latest AI-detected infrastructure issues</p>
              </div>
            </div>
            <Link to="/map" className="text-xs text-accent hover:underline font-medium">
              View All →
            </Link>
          </div>

          {issues.length === 0 ? (
            <EmptyState title="No detections yet" description="Issues will appear here as they are detected by the fleet." />
          ) : (
            <div className="space-y-2">
              {issues.slice(0, 5).map((issue) => {
                const statusVariant = issue.status === 'resolved' ? 'success' : issue.status === 'assigned' ? 'warning' : 'danger';
                const TypeIcon = issue.type === 'pothole' ? AlertTriangle : issue.type === 'garbage' ? Trash2 : ShieldAlert;
                return (
                  <div
                    key={issue.id}
                    className="flex items-center gap-3 p-3 bg-surface-muted rounded-inner hover:bg-surface-hover transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      issue.type === 'pothole' ? 'bg-danger-soft' : issue.type === 'garbage' ? 'bg-warning-soft' : 'bg-accent-soft'
                    }`}>
                      <TypeIcon className={`w-5 h-5 ${
                        issue.type === 'pothole' ? 'text-danger' : issue.type === 'garbage' ? 'text-warning' : 'text-accent'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-content truncate">{issue.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-content-muted flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {issue.location?.address?.split(',')[0]}
                        </span>
                        <span className="text-xs text-content-subtle">
                          {new Date(issue.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <Badge variant={statusVariant}>{issue.status}</Badge>
                    <Badge variant={issue.severity === 'high' ? 'danger' : issue.severity === 'medium' ? 'warning' : 'neutral'}>
                      {issue.severity}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
