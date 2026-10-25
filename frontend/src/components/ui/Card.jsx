import React from 'react';
import { cn } from '../../utils/cn';

export default function Card({ children, className, ...props }) {
  return (
    <section
      className={cn(
        'bg-surface rounded-card shadow-card p-6 border border-border/40 transition-colors duration-200',
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
