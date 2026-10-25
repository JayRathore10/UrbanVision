import React from 'react';
import { cn } from '../../utils/cn';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirm Action', description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', loading = false }) {
  if (!open) return null;

  const confirmStyles = {
    danger: 'bg-danger text-white hover:bg-danger/90',
    warning: 'bg-warning text-white hover:bg-warning/90',
    accent: 'bg-accent text-accent-contrast hover:bg-accent/90',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-card p-6 max-w-sm w-full shadow-card relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-content-muted hover:text-content rounded-full hover:bg-surface-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-inner bg-warning-soft flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-content">{title}</h3>
            {description && <p className="text-sm text-content-muted mt-1">{description}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-content bg-surface-muted hover:bg-surface-hover rounded-pill border border-border transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-pill transition-colors disabled:opacity-50',
              confirmStyles[variant] || confirmStyles.danger
            )}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
