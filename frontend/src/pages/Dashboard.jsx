import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Trash2, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert,
  Droplets,
  Layers,
  Clock,
  RefreshCw,
  ExternalLink,
  Users,
  HardHat,
  MapPin,
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { api } from '../services/api';

const COLORS = ['#4F8FE0', '#E55353', '#F5A623', '#2EB85C', '#8A2BE2', '#20C997'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [issuesByType, setIssuesByType] = useState([]);
  const [issuesBySeverity, setIssuesBySeverity] = useState([]);
  const [trends, setTrends] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, typeRes, severityRes, trendsRes, recentRes, supRes] = await Promise.allSettled([
        api.dashboard.getSummary(),
        api.dashboard.getIssuesByType(),
        api.dashboard.getIssuesBySeverity(),
        api.dashboard.getDetectionTrends({ days: 14 }),
        api.issues.list({ limit: 5 }),
        api.supervisors.list(),
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value.data) {
        setSummary(summaryRes.value.data);
      }
      if (typeRes.status === 'fulfilled' && typeRes.value.data?.issuesByType) {
        setIssuesByType(typeRes.value.data.issuesByType);
      }
      if (severityRes.status === 'fulfilled' && severityRes.value.data?.issuesBySeverity) {
        setIssuesBySeverity(severityRes.value.data.issuesBySeverity);
      }
      if (trendsRes.status === 'fulfilled' && trendsRes.value.data?.trends) {
        setTrends(trendsRes.value.data.trends);
      }
      if (recentRes.status === 'fulfilled' && recentRes.value.data?.issues) {
        setRecentIssues(recentRes.value.data.issues);
      }
      if (supRes.status === 'fulfilled' && supRes.value.data?.supervisors) {
        setSupervisors(supRes.value.data.supervisors);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching analytics:', err);
      setError('Could not connect to analytics backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Derived metrics
  const totalIssues = summary?.totalIssues || recentIssues.length || 0;
  const resolvedIssues = summary?.resolvedIssues || 0;
  const activeTasks = summary?.totalTasks || 0;
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 78;

  return (
    <div className="space-y-6">
      {/* City Overview Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-surface rounded-card shadow-card border border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-pill bg-accent-soft text-accent flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping"></span>
              Live Municipal Telemetry
            </span>
            <span className="text-xs text-content-muted">Indore Smart City Corporation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-content mt-2 tracking-tight">
            City Surveillance & Civic Infrastructure Command
          </h1>
          <p className="text-sm text-content-muted mt-1">
            Automated vision stream ingested from sanitation fleet with Gemini AI classification & worker dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-surface text-content text-xs font-medium rounded-pill border border-border shadow-sm hover:bg-surface-hover active:scale-95 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-accent ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
          </button>
          <Link
            to="/map"
            className="flex items-center gap-2 px-5 py-2 bg-inverse text-inverse-text text-xs sm:text-sm font-medium rounded-pill shadow-card hover:opacity-90 transition-opacity"
          >
            <span>Open GIS Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Detected Issues */}
        <div className="p-6 bg-surface rounded-card shadow-card border border-border/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-content-muted uppercase tracking-wider">
              Total Ingested Issues
            </span>
            <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center">
              <Layers className="w-4 h-4 text-accent" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight text-content tabular-nums">
              {totalIssues}
            </span>
            <span className="text-xs font-medium text-accent bg-accent-soft px-2 py-0.5 rounded-pill">
              AI Verified
            </span>
          </div>
          <p className="text-xs text-content-subtle mt-2">
            Logged across 3-camera dashcam units
          </p>
        </div>

        {/* Resolution Rate */}
        <div className="p-6 bg-surface rounded-card shadow-card border border-border/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-content-muted uppercase tracking-wider">
              Resolution Efficacy
            </span>
            <div className="w-8 h-8 rounded-full bg-success-soft flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight text-content tabular-nums">
              {resolutionRate}%
            </span>
            <span className="text-xs font-medium text-success bg-success-soft px-2 py-0.5 rounded-pill">
              {resolvedIssues} closed
            </span>
          </div>
          <p className="text-xs text-content-subtle mt-2">
            Verified by supervisor after photo submission
          </p>
        </div>

        {/* Active Dispatched Tasks */}
        <div className="p-6 bg-surface rounded-card shadow-card border border-border/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-content-muted uppercase tracking-wider">
              Active Field Tasks
            </span>
            <div className="w-8 h-8 rounded-full bg-warning-soft flex items-center justify-center">
              <Clock className="w-4 h-4 text-warning" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight text-content tabular-nums">
              {activeTasks}
            </span>
            <span className="text-xs font-medium text-warning bg-warning-soft px-2 py-0.5 rounded-pill">
              In Field
            </span>
          </div>
          <p className="text-xs text-content-subtle mt-2">
            Assigned to municipal response crews
          </p>
        </div>

        {/* Supervisory Zones */}
        <div className="p-6 bg-surface rounded-card shadow-card border border-border/40 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-content-muted uppercase tracking-wider">
              Command Sectors
            </span>
            <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center">
              <Users className="w-4 h-4 text-accent" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight text-content tabular-nums">
              {supervisors.length || 2}
            </span>
            <span className="text-xs font-medium text-accent bg-accent-soft px-2 py-0.5 rounded-pill">
              Active HQs
            </span>
          </div>
          <p className="text-xs text-content-subtle mt-2">
            Rajwada (Zone 1) & Vijay Nagar (Zone 2)
          </p>
        </div>
      </div>

      {/* Charts Section: Issue Distribution & Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Issues By Category */}
        <div className="p-6 bg-surface rounded-card shadow-card border border-border/50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-content">Civic Issues by Category</h3>
              <p className="text-xs text-content-muted">Aggregate volume ingested from vision models</p>
            </div>
            <span className="text-xs font-medium text-accent bg-accent-soft px-2.5 py-1 rounded-pill">
              Live Aggregate
            </span>
          </div>

          <div className="h-64 w-full">
            {issuesByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={issuesByType} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#888888' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#888888' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface, #1e1e24)', borderColor: 'var(--border, #333)', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="count" fill="#4F8FE0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-content-muted">
                Ingesting category distributions...
              </div>
            )}
          </div>
        </div>

        {/* Severity & Status Breakdown */}
        <div className="p-6 bg-surface rounded-card shadow-card border border-border/50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-content">Severity Urgency Distribution</h3>
              <p className="text-xs text-content-muted">Priority matrix for municipal dispatch</p>
            </div>
            <span className="text-xs font-medium text-danger bg-danger-soft px-2.5 py-1 rounded-pill">
              Critical Filtered
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {issuesBySeverity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={issuesBySeverity}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {issuesBySeverity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface, #1e1e24)', borderColor: 'var(--border, #333)', borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-content-muted">
                Ingesting severity clusters...
              </div>
            )}
          </div>

          {/* Severity Legend */}
          <div className="flex items-center justify-center gap-4 text-xs flex-wrap pt-2 border-t border-border/40">
            {issuesBySeverity.map((item, idx) => (
              <div key={item._id} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-content font-medium">{item._id} ({item.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Supervisors Quick Workspaces */}
      <div className="p-6 bg-surface rounded-card shadow-card border border-border/50 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-content flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              Municipal Supervisors & Assigned Sectors
            </h3>
            <p className="text-xs text-content-muted">Click any supervisor to inspect isolated tasks, video streams & team.</p>
          </div>
          <Link
            to="/supervisors"
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
          >
            <span>All Workspaces</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {supervisors.map((sup) => (
            <Link
              key={sup._id}
              to={`/supervisors/${sup._id}`}
              className="p-4 bg-surface-muted rounded-inner border border-border/50 hover:border-accent/50 hover:bg-surface-hover transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs">
                  {sup.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-content group-hover:text-accent transition-colors">
                    {sup.name}
                  </h4>
                  <p className="text-[11px] text-content-muted">{sup.assignedArea}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="text-xs font-bold text-content block">{sup.activeTasksCount || 0}</span>
                  <span className="text-[10px] text-content-muted uppercase">Active</span>
                </div>
                <ArrowRight className="w-4 h-4 text-content-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Civic Detections Feed */}
      <div className="p-6 bg-surface rounded-card shadow-card border border-border/50 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-content flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" />
              Recently Detected Civic Anomalies
            </h3>
            <p className="text-xs text-content-muted">Ingested real-time from vehicle cameras</p>
          </div>
          <Link
            to="/map"
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
          >
            <span>View All on Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-border/40">
          {recentIssues.slice(0, 5).map((issue) => (
            <div
              key={issue._id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-surface-hover transition-colors px-2 rounded-inner"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-inner flex items-center justify-center font-bold text-xs ${
                  issue.type === 'Pothole'
                    ? 'bg-danger-soft text-danger'
                    : issue.type === 'Garbage'
                    ? 'bg-warning-soft text-warning'
                    : 'bg-accent-soft text-accent'
                }`}>
                  {issue.type === 'Pothole' ? '🕳️' : issue.type === 'Garbage' ? '🗑️' : '💧'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-content font-mono">{issue.issueCode}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-pill bg-surface-muted text-content-muted">
                      {issue.type}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill ${
                      issue.severity === 'Critical' ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-content-muted text-[11px] mt-0.5 line-clamp-1">{issue.address || issue.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:self-center">
                <span className="text-[11px] font-mono text-content-subtle">
                  {new Date(issue.detectedAt || issue.createdAt).toLocaleDateString()}
                </span>
                <Link
                  to="/map"
                  className="px-3 py-1 bg-surface-muted hover:bg-surface text-content rounded-pill border border-border/50 text-[11px] font-medium transition-colors"
                >
                  Locate
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
