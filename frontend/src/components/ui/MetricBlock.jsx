import React from 'react';
import { cn } from '../../utils/cn';
import Badge from './Badge';

export default function MetricBlock({ value, label, delta, deltaVariant = 'success', icon: Icon, iconBg = 'bg-accent-soft', iconColor = 'text-accent', className }) {
  return (
    <div className={cn('flex flex-col justify-between', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-content-muted uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', iconBg)}>
            <Icon className={cn('w-4 h-4', iconColor)} />
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight text-content tabular-nums">
          {value}
        </span>
        {delta && (
          <Badge variant={deltaVariant}>{delta}</Badge>
        )}
      </div>
    </div>
  );
}
