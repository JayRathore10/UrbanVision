import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';

export default function AuthModal({ open, onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('worker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const toast = useToast();

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({ name, email, password, role });
        toast.success(`Account registered! Logged in as ${name}`);
      } else {
        await login(email, password);
        toast.success('Successfully authenticated!');
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-card p-6 max-w-sm w-full shadow-card relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-content-muted hover:text-content hover:bg-surface-muted rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-inner bg-accent-soft flex items-center justify-center">
            <Lock className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-content">
              {isRegister ? 'Register Worker Profile' : 'UrbanVision Access'}
            </h3>
            <p className="text-xs text-content-muted">Municipal Operations Authentication</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-3 bg-danger-soft border border-danger/30 rounded-inner text-xs text-danger">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-content-muted uppercase mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-content-subtle absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Officer / Crew Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-surface-muted text-content text-xs rounded-pill border border-border focus:ring-2 focus:ring-accent outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-content-muted uppercase mb-1">
              Official Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-content-subtle absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="officer@indore-imc.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-muted text-content text-xs rounded-pill border border-border focus:ring-2 focus:ring-accent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-muted uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-content-subtle absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-muted text-content text-xs rounded-pill border border-border focus:ring-2 focus:ring-accent outline-none"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-content-muted uppercase mb-1">
                Role Designation
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-surface-muted text-content text-xs rounded-pill border border-border focus:ring-2 focus:ring-accent outline-none"
              >
                <option value="worker">Municipal Field Worker</option>
                <option value="supervisor">Ward Operations Supervisor</option>
                <option value="admin">Central Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-inverse text-inverse-text text-xs font-semibold rounded-pill hover:opacity-90 disabled:opacity-50 transition-opacity mt-2"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Worker Account' : 'Authenticate & Sign In'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-border/40 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-xs text-accent hover:underline font-medium"
          >
            {isRegister ? 'Already registered? Sign In' : 'Need worker profile? Register account'}
          </button>
        </div>
      </div>
    </div>
  );
}
