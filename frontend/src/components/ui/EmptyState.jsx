import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = AlertCircle,
  title = 'No records found',
  description = 'No items match your selected filters or criteria.',
  actionLabel = null,
  onAction = null,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-border bg-surface/50 ${className}`}>
    <div className="p-3 bg-surface-2 rounded-full text-text-muted mb-3">
      <Icon className="w-8 h-8" />
    </div>
    <h4 className="text-base font-semibold text-text-primary mb-1">{title}</h4>
    <p className="text-sm text-text-secondary max-w-md mb-4">{description}</p>
    {actionLabel && onAction && (
      <Button variant="secondary" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);
