import React from 'react';
import { cn } from '../../utils/cn';

const variants = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  accent: 'bg-accent-soft text-accent',
  delta: 'bg-accent text-accent-contrast',
  neutral: 'bg-surface-muted text-content-muted',
};

export default function Badge({ children, variant = 'neutral', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-pill uppercase tracking-wide',
        variants[variant] || variants.neutral,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
