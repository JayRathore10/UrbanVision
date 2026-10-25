import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Eye, 
  LayoutDashboard, 
  MapPin, 
  HardHat, 
  Sun, 
  Moon, 
  Laptop, 
  Cpu, 
  ChevronDown, 
  Check, 
  Menu, 
  X,
  Radio,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export default function TopNav() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const themeRef = useRef(null);

  // Close dropdown on click outside
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
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-bg/80 border-b border-border transition-colors duration-200">
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
                    `flex items-center gap-2 px-5 py-2 text-xs md:text-sm font-medium rounded-pill transition-all duration-200 ${
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

          {/* Right: Actions (Theme Toggle & Simulator Pill) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Edge AI Simulator Trigger Button */}
            <button
              onClick={() => setShowSimModal(true)}
              className="relative flex items-center gap-2 px-4 py-2 bg-inverse text-inverse-text text-xs sm:text-sm font-medium rounded-pill shadow-sm hover:opacity-90 active:scale-95 transition-all duration-150 group"
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

            {/* Theme Dropdown Toggle */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => setThemeDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-2 bg-surface hover:bg-surface-hover text-content rounded-pill border border-border shadow-card transition-colors duration-150"
                aria-label="Toggle theme mode"
                aria-haspopup="true"
                aria-expanded={themeDropdownOpen}
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

      {/* Simulator Modal Placeholder (Phase 4 Trigger) */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-card p-6 max-w-md w-full shadow-card relative">
            <button
              onClick={() => setShowSimModal(false)}
              className="absolute top-4 right-4 p-1.5 text-content-muted hover:text-content rounded-full hover:bg-surface-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-inner bg-accent-soft flex items-center justify-center">
                <Cpu className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-content">Edge AI Simulator</h3>
                <p className="text-xs text-content-muted">Municipal Garbage Truck Dashcam Unit</p>
              </div>
            </div>

            <div className="bg-surface-muted rounded-inner p-4 mb-4 border border-border/50 text-xs text-content-muted space-y-2">
              <p className="flex items-center gap-1.5 text-content font-medium">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                Live Demo Control Center
              </p>
              <p>
                In <strong>Phase 4</strong>, this modal powers live edge camera broadcasts:
              </p>
              <ul className="list-disc list-inside space-y-1 text-content-subtle pl-1">
                <li>Broadcast new pothole / garbage detections to the GIS map.</li>
                <li>Simulate 2nd truck passing within 5m to showcase MongoDB <code className="text-accent font-mono">$near</code> deduplication.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSimModal(false)}
                className="px-5 py-2 bg-inverse text-inverse-text text-xs font-medium rounded-pill hover:opacity-90 transition-opacity"
              >
                Close Simulator Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
