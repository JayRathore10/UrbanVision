import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { cn } from '../../utils/cn';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: 'border-success/30 bg-success-soft',
  warning: 'border-warning/30 bg-warning-soft',
  error: 'border-danger/30 bg-danger-soft',
  info: 'border-accent/30 bg-accent-soft',
};

const textStyles = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-danger',
  info: 'text-accent',
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type, duration) => addToast(message, type, duration), [addToast]);
  toast.success = (msg, dur) => addToast(msg, 'success', dur);
  toast.warning = (msg, dur) => addToast(msg, 'warning', dur);
  toast.error = (msg, dur) => addToast(msg, 'error', dur);
  toast.info = (msg, dur) => addToast(msg, 'info', dur);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const Icon = icons[t.type] || icons.info;
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-4 rounded-inner border shadow-card backdrop-blur-sm animate-in slide-in-from-right-5 fade-in duration-200',
                styles[t.type] || styles.info
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', textStyles[t.type])} />
              <p className="text-sm text-content flex-1">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 hover:bg-surface-hover rounded-full transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5 text-content-muted" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
