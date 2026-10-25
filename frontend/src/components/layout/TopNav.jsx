import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Eye, LayoutDashboard, MapPin, HardHat, ShieldCheck, Sun, Moon, Laptop,
  Cpu, ChevronDown, Check, Menu, X, Radio, LogIn, LogOut, User
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import EdgeSimulatorModal from '../EdgeSimulatorModal';
import AuthModal from '../auth/AuthModal';

export default function TopNav() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const themeRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setThemeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'GIS Map', to: '/map', icon: MapPin },
    { label: 'Worker App', to: '/worker', icon: HardHat },
    { label: 'Supervisor', to: '/supervisor', icon: ShieldCheck },
  ];

  const themeOptions = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'system', label: 'System', icon: Laptop },
  ];

  const CurrentThemeIcon =
    theme === 'system' ? Laptop : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-bg/85 border-b border-border transition-colors duration-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Left: Logo Pill */}
          <div className="flex items-center gap-3">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-4 py-2 bg-surface hover:bg-surface-hover rounded-pill shadow-card transition-all duration-200 group border border-border/40"
            >
              <div className="w-8 h-8 rounded-full bg-inverse text-inverse-text flex items-center justify-center transition-transform group-hover:scale-105">
                <Eye className="w-4 h-4 text-accent" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight text-content leading-none">
                  Urban<span className="text-accent">Vision</span>
                </span>
                <span className="text-[10px] text-content-muted font-medium mt-0.5 tracking-wider uppercase">
                  Municipal AI
                </span>
              </div>
            </NavLink>
          </div>

          {/* Center: Desktop Navigation Pills */}
          <nav className="hidden md:flex items-center p-1.5 bg-surface-muted/90 rounded-pill border border-border shadow-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-pill transition-all duration-200 ${
                      isActive
                        ? 'bg-surface text-content shadow-card'
                        : 'text-content-muted hover:text-content hover:bg-surface/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Edge AI Simulator Trigger Button */}
            <button
              onClick={() => setShowSimModal(true)}
              className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-inverse text-inverse-text text-xs sm:text-sm font-medium rounded-pill shadow-sm hover:opacity-90 active:scale-95 transition-all duration-150 group"
              title="Interactive Edge AI Truck Simulator"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <Radio className="w-3.5 h-3.5 text-accent group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Edge AI Simulator</span>
              <span className="sm:hidden">Sim</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-accent/20 text-accent rounded-full uppercase tracking-widest font-semibold ml-1">
                Demo
              </span>
            </button>

            {/* Auth Button */}
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 bg-surface text-content text-xs font-medium rounded-pill border border-border hover:bg-surface-hover shadow-card transition-colors"
                title={`Logged in as ${user?.name || user?.email || 'User'}`}
              >
                <User className="w-3.5 h-3.5 text-accent" />
                <span className="hidden lg:inline">{user?.name?.split(' ')[0] || 'User'}</span>
                <LogOut className="w-3 h-3 text-content-muted" />
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-surface text-content text-xs font-medium rounded-pill border border-border hover:bg-surface-hover shadow-card transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-accent" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Theme Dropdown Toggle */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => setThemeDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-2 bg-surface hover:bg-surface-hover text-content rounded-pill border border-border shadow-card transition-colors duration-150"
                aria-label="Toggle theme mode"
              >
                <CurrentThemeIcon className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium capitalize hidden lg:inline text-content-muted">
                  {theme}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-content-muted" />
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-surface border border-border rounded-inner shadow-card py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[11px] font-semibold text-content-subtle uppercase tracking-wider">
                    Appearance
                  </div>
                  {themeOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = theme === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setTheme(opt.key);
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                          isSelected
                            ? 'bg-surface-muted text-accent font-medium'
                            : 'text-content hover:bg-surface-hover'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-content-muted" />
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 bg-surface text-content rounded-pill border border-border shadow-card"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface px-4 py-3 space-y-1 shadow-card animate-in slide-in-from-top-2 duration-150">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-pill text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-surface-muted text-accent shadow-sm'
                        : 'text-content-muted hover:text-content hover:bg-surface-hover'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* Edge Simulator Modal */}
      <EdgeSimulatorModal open={showSimModal} onClose={() => setShowSimModal(false)} />

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
