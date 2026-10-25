import React from 'react';
import { cn } from '../../utils/cn';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'No data available', description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-content-subtle" />
      </div>
      <h3 className="text-sm font-semibold text-content mb-1">{title}</h3>
      {description && <p className="text-xs text-content-muted max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
