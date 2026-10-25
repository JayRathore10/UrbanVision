import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  HardHat,
  Crown,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Radio,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ---------------------------------------------------------------------------
// Demo accounts matching the backend seed script (seedData.js)
// Supervisor role → /supervisor/map, Worker role → /worker/tasks
// ---------------------------------------------------------------------------
const TEST_ACCOUNTS = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh@urbanvision.gov.in',
    password: 'Password123',
    role: 'supervisor',
    department: 'Roads & Civil Infrastructure',
    assignedArea: 'Zone 1 - Rajwada',
  },
  {
    name: 'Priya Sharma',
    email: 'priya@urbanvision.gov.in',
    password: 'Password123',
    role: 'supervisor',
    department: 'Sanitation & Drainage Operations',
    assignedArea: 'Zone 2 - Vijay Nagar',
  },
  {
    name: 'Amit Patel',
    email: 'amit@urbanvision.gov.in',
    password: 'Password123',
    role: 'worker',
    department: 'Pavement Maintenance Crew',
    assignedArea: 'Zone 1 - Central Indore',
  },
  {
    name: 'Sunita Verma',
    email: 'sunita@urbanvision.gov.in',
    password: 'Password123',
    role: 'worker',
    department: 'Sanitation Response Team',
    assignedArea: 'Zone 1 - Central Indore',
  },
];

// Helper to determine role-based home route
const getHomeRoute = (role) => {
  switch (role?.toLowerCase()) {
    case 'supervisor':
      return '/supervisor/map';
    case 'worker':
      return '/worker/tasks';
    default:
      return '/supervisor/map';
  }
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect immediately to role home
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(getHomeRoute(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        // Role is set on user state after login — determine redirect from test accounts as well
        const matchedAccount = TEST_ACCOUNTS.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase()
        );
        navigate(getHomeRoute(matchedAccount?.role || user?.role), { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Make sure the backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
    setSubmitting(true);
    try {
      await login(acc.email, acc.password);
      navigate(getHomeRoute(acc.role), { replace: true });
    } catch (err) {
      setError(err.message || 'Quick login failed. Make sure the backend is running at http://localhost:5000');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-5xl py-4 sm:py-8 animate-in fade-in duration-300">
        {/* Header / Branding */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-accent-soft text-accent text-xs font-semibold uppercase tracking-wider mb-2 border border-accent/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Indore Municipal Corporation • Smart Civic AI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-content">
            Urban<span className="text-accent">Vision</span> Portal
          </h1>
          <p className="text-sm text-content-muted">
            Authenticated Edge-to-Cloud road infrastructure and sanitation telemetry system.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: System Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 bg-surface rounded-card border border-border shadow-card space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-inverse text-inverse-text flex items-center justify-center font-bold">
                  <Cpu className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-content leading-tight">
                    Autonomous Inspection Network
                  </h2>
                  <p className="text-[11px] text-content-muted">
                    Indore Edge Fleet Vehicle Units • Live
                  </p>
                </div>
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Real-time synchronization between vehicle dashcams, Google Gemini 2.0 multimodal
                analysis, and role-based municipal action workflows.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-surface-muted rounded-inner border border-border/40">
                  <span className="text-2xl font-bold text-content block tabular-nums">94.2%</span>
                  <span className="text-[11px] text-content-muted">AI Detection Precision</span>
                </div>
                <div className="p-3 bg-surface-muted rounded-inner border border-border/40">
                  <span className="text-2xl font-bold text-accent block tabular-nums">15m</span>
                  <span className="text-[11px] text-content-muted">Geo-Deduplication</span>
                </div>
              </div>

              <div className="p-3 bg-accent-soft/50 rounded-inner border border-accent/20 text-xs text-content flex items-center gap-2">
                <Radio className="w-4 h-4 text-accent flex-shrink-0 animate-pulse" />
                <span className="text-[11px] font-medium">
                  Role segregation active: Supervisors &amp; Workers view dedicated portals.
                </span>
              </div>
            </div>

            <div className="p-5 bg-surface rounded-card border border-border shadow-card space-y-2.5">
              <h3 className="text-xs font-bold text-content uppercase tracking-wider text-content-subtle">
                Role Segregated Capabilities
              </h3>
              <ul className="text-xs space-y-2 text-content-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>
                    <strong>Supervisor:</strong> Issue triage, video ingestion &amp; task dispatch
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-warning flex-shrink-0" />
                  <span>
                    <strong>Worker:</strong> Mobile task execution &amp; photographic resolution
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Login Form + Test Accounts */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-8 bg-surface rounded-card border border-border shadow-card">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-content">Sign In to Your Workspace</h2>
                <p className="text-xs text-content-muted mt-1">
                  Enter your municipal credentials or choose a 1-click test account below.
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 bg-danger-soft border border-danger/30 rounded-inner flex items-center gap-3 text-xs text-danger animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-content-muted uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-subtle">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rajesh@urbanvision.gov.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-border rounded-pill text-sm text-content placeholder-content-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-150"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-content-muted uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-subtle">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-10 py-2.5 bg-surface-muted border border-border rounded-pill text-sm text-content placeholder-content-subtle focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-150"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-content-subtle hover:text-content"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-3 px-6 bg-inverse text-inverse-text text-sm font-semibold rounded-pill shadow-sm hover:opacity-90 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="inline-block animate-pulse">Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Test Accounts */}
            <div className="p-6 bg-surface rounded-card border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-content flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>Quick Test Accounts</span>
                  </h3>
                  <p className="text-[11px] text-content-muted">
                    Seeded real backend accounts • 1-click evaluation
                  </p>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-surface-muted text-content-muted rounded-pill border border-border">
                  Demo Ready
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                {TEST_ACCOUNTS.map((acc) => {
                  const roleLower = acc.role.toLowerCase();
                  const isSupervisor = roleLower === 'supervisor';
                  const Icon = isSupervisor ? ShieldCheck : HardHat;
                  const badgeColor = isSupervisor
                    ? 'bg-accent-soft text-accent border-accent/20'
                    : 'bg-warning-soft text-warning border-warning/30';

                  return (
                    <div
                      key={acc.email}
                      className="p-3.5 bg-surface-muted hover:bg-surface-hover rounded-inner border border-border/60 transition-all duration-150 flex flex-col justify-between text-left space-y-2 group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-pill border ${badgeColor}`}
                          >
                            {acc.role}
                          </span>
                          <Icon className="w-3.5 h-3.5 text-content-muted group-hover:text-accent transition-colors" />
                        </div>
                        <p className="text-xs font-bold text-content truncate leading-tight">
                          {acc.name}
                        </p>
                        <p className="text-[10px] text-content-muted truncate font-mono mt-0.5">
                          {acc.email}
                        </p>
                        <p className="text-[10px] text-content-subtle font-mono">
                          pw: {acc.password}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleQuickLogin(acc)}
                        className="w-full py-1.5 px-2 bg-surface hover:bg-surface-muted border border-border/80 text-[11px] font-semibold text-content rounded-pill transition-colors flex items-center justify-center gap-1.5 shadow-sm group-hover:border-accent/40 disabled:opacity-50"
                      >
                        <span>1-Click Login</span>
                        <ArrowRight className="w-3 h-3 text-accent" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
