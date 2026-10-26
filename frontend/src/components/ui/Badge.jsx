import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Flame, Droplets, Wind, Zap } from 'lucide-react';

export const Badge = ({
  children,
  variant = 'info',
  severity = null,
  status = null,
  className = '',
  icon = null,
}) => {
  // Severity-based styling (Never rely on color alone — incorporates clear labels & icons)
  if (severity) {
    const severityMap = {
      critical: {
        bg: 'bg-danger/15 text-danger border border-danger/30',
        icon: <Flame className="w-3.5 h-3.5" aria-hidden="true" />,
        label: 'CRITICAL',
      },
      high: {
        bg: 'bg-warning/15 text-warning border border-warning/30',
        icon: <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />,
        label: 'HIGH',
      },
      medium: {
        bg: 'bg-primary/15 text-primary-light border border-primary/30',
        icon: <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />,
        label: 'MEDIUM',
      },
      low: {
        bg: 'bg-accent/15 text-accent border border-accent/30',
        icon: <Info className="w-3.5 h-3.5" aria-hidden="true" />,
        label: 'LOW',
      },
      warning: {
        bg: 'bg-danger/15 text-danger border border-danger/30',
        icon: <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />,
        label: 'WARNING',
      },
      advisory: {
        bg: 'bg-warning/15 text-warning border border-warning/30',
        icon: <Info className="w-3.5 h-3.5" aria-hidden="true" />,
        label: 'ADVISORY',
      },
    };

    const config = severityMap[severity.toLowerCase()] || severityMap.medium;

    return (
      <span className={`badge-pill ${config.bg} ${className}`}>
        {config.icon}
        <span>{children || config.label}</span>
      </span>
    );
  }

  // Status-based styling
  if (status) {
    const statusMap = {
      submitted: 'bg-info/15 text-info border border-info/30',
      pending_review: 'bg-warning/15 text-warning border border-warning/30',
      acknowledged: 'bg-primary/15 text-primary-light border border-primary/30',
      in_progress: 'bg-accent/15 text-accent border border-accent/30 animate-pulse',
      resolved: 'bg-success/15 text-success border border-success/30',
      closed: 'bg-surface-2 text-text-muted border border-border',
      rejected: 'bg-danger/15 text-danger border border-danger/30',
      open: 'bg-success/15 text-success border border-success/30',
    };

    const style = statusMap[status.toLowerCase()] || 'bg-surface-2 text-text-secondary';
    return (
      <span className={`badge-pill ${style} ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
        <span>{children || status.replace('_', ' ').toUpperCase()}</span>
      </span>
    );
  }

  const variants = {
    primary: 'bg-primary/15 text-primary-light border border-primary/30',
    accent: 'bg-accent/15 text-accent border border-accent/30',
    danger: 'bg-danger/15 text-danger border border-danger/30',
    warning: 'bg-warning/15 text-warning border border-warning/30',
    success: 'bg-success/15 text-success border border-success/30',
    info: 'bg-info/15 text-info border border-info/30',
    outline: 'border border-border text-text-secondary',
  };

  return (
    <span className={`badge-pill ${variants[variant] || variants.info} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
