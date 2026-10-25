import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  HardHat, 
  Building2, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ defaultTab = 'login' }) {
  const navigate = useNavigate();
  const { user, login, register, logout, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState(defaultTab); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Login Form State
  const [loginForm, setLoginForm] = useState({
    email: 'admin@urbanvision.gov.in',
    password: 'Password123',
  });

  // Register Form State
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Worker',
    department: 'Roads & Civil Maintenance',
    assignedArea: 'Zone 1 - Central Indore',
    employeeId: '',
  });

  // Quick 1-Click Fill Preset
  const handleSelectPreset = (email, password = 'Password123') => {
    setLoginForm({ email, password });
    setError(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await login(loginForm.email, loginForm.password);
      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 600);
    } catch (err) {
      console.error('[AuthPage] Login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await register(registerForm);
      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 800);
    } catch (err) {
      console.error('[AuthPage] Registration error:', err);
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="max-w-md w-full bg-surface border border-border rounded-card shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-inverse text-inverse-text flex items-center justify-center mx-auto shadow-md">
            <Eye className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-xl font-bold text-content tracking-tight">
            Urban<span className="text-accent">Vision</span> Portal
          </h1>
          <p className="text-xs text-content-muted">
            Municipal AI Road Inspection & Task Remediation Platform
          </p>
        </div>

        {/* Current Active Session Banner (If already logged in) */}
        {isAuthenticated && user && (
          <div className="p-3.5 bg-surface-muted rounded-inner border border-border/60 text-xs flex items-center justify-between gap-3">
            <div>
              <p className="text-content font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                Currently logged in:
              </p>
              <p className="text-content-muted text-[11px] mt-0.5">
                {user.name} ({user.role}) • {user.email}
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1 px-3 py-1 bg-surface hover:bg-surface-hover text-danger text-[11px] font-semibold rounded-pill border border-border transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Log Out</span>
            </button>
          </div>
        )}

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="flex bg-surface-muted p-1 rounded-pill border border-border/60 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-pill font-semibold transition-all text-center ${
              activeTab === 'login'
                ? 'bg-accent text-white shadow-sm'
                : 'text-content-muted hover:text-content'
            }`}
          >
            Sign In (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-pill font-semibold transition-all text-center ${
              activeTab === 'register'
                ? 'bg-accent text-white shadow-sm'
                : 'text-content-muted hover:text-content'
            }`}
          >
            Create Account (Sign Up)
          </button>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="p-3.5 bg-danger-soft border border-danger/30 rounded-inner text-xs text-danger flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-3.5 bg-success-soft border border-success/30 rounded-inner text-xs text-success flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: SIGN IN */}
        {activeTab === 'login' && (
          <div className="space-y-4">
            {/* Quick 1-Click Fill Preset Pills */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-content-muted block">
                Quick 1-Click Role Login:
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('admin@urbanvision.gov.in')}
                  className={`p-2 rounded-inner border text-center transition-all ${
                    loginForm.email === 'admin@urbanvision.gov.in'
                      ? 'bg-accent-soft text-accent border-accent font-semibold'
                      : 'bg-surface-muted text-content hover:bg-surface-hover border-border/60'
                  }`}
                >
                  <span className="block text-sm">👑</span>
                  <span className="text-[11px]">Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('supervisor@urbanvision.gov.in')}
                  className={`p-2 rounded-inner border text-center transition-all ${
                    loginForm.email === 'supervisor@urbanvision.gov.in'
                      ? 'bg-accent-soft text-accent border-accent font-semibold'
                      : 'bg-surface-muted text-content hover:bg-surface-hover border-border/60'
                  }`}
                >
                  <span className="block text-sm">🛡️</span>
                  <span className="text-[11px]">Supervisor</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('worker@urbanvision.gov.in')}
                  className={`p-2 rounded-inner border text-center transition-all ${
                    loginForm.email === 'worker@urbanvision.gov.in'
                      ? 'bg-accent-soft text-accent border-accent font-semibold'
                      : 'bg-surface-muted text-content hover:bg-surface-hover border-border/60'
                  }`}
                >
                  <span className="block text-sm">👷</span>
                  <span className="text-[11px]">Worker</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-content">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-content-muted absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@urbanvision.gov.in"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-surface-muted border border-border rounded-inner focus:outline-none focus:ring-1 focus:ring-accent text-content"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-content">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-content-muted absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full text-xs pl-9 pr-10 py-2 bg-surface-muted border border-border rounded-inner focus:outline-none focus:ring-1 focus:ring-accent text-content"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-content-muted hover:text-content"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-xs font-semibold rounded-pill shadow-card flex items-center justify-center gap-2 transition-all mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: CREATE ACCOUNT (SIGN UP) */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-content">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-content-muted absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-surface-muted border border-border rounded-inner focus:outline-none focus:ring-1 focus:ring-accent text-content"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-content">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-content-muted absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@urbanvision.gov.in"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-surface-muted border border-border rounded-inner focus:outline-none focus:ring-1 focus:ring-accent text-content"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-content">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-content-muted absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full text-xs pl-9 pr-10 py-2 bg-surface-muted border border-border rounded-inner focus:outline-none focus:ring-1 focus:ring-accent text-content"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-content-muted hover:text-content"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role & Phone */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-content">Account Role</label>
                <select
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-surface-muted border border-border rounded-inner focus:outline-none focus:ring-1 focus:ring-accent text-content"
                >
                  <option value="Worker">Worker (Crew)</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-content">Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="+91 98765..."
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-surface-muted border border-border rounded-inner focus:outline-none focus:ring-1 focus:ring-accent text-content"
                />
              </div>
            </div>

            {/* Assigned Zone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-content">Municipal Zone / Area</label>
              <input
                type="text"
                placeholder="e.g. Zone 1 - Central Indore"
                value={registerForm.assignedArea}
                onChange={(e) => setRegisterForm({ ...registerForm, assignedArea: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-surface-muted border border-border rounded-inner focus:outline-none focus:ring-1 focus:ring-accent text-content"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-xs font-semibold rounded-pill shadow-card flex items-center justify-center gap-2 transition-all mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
