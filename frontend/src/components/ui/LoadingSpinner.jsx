import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', className, text }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-accent', sizes[size])} />
      {text && <p className="text-sm text-content-muted">{text}</p>}
    </div>
  );
}
