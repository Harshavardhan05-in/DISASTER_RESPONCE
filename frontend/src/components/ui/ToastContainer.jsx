import React from 'react';
import { useUIStore } from '../../lib/store/uiStore';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useUIStore();

  if (!toasts.length) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-danger flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-info flex-shrink-0" />,
  };

  const borders = {
    success: 'border-success/30 bg-surface',
    error: 'border-danger/30 bg-surface',
    warning: 'border-warning/30 bg-surface',
    info: 'border-info/30 bg-surface',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl ${
            borders[toast.type] || borders.info
          } animate-slide-up`}
        >
          {icons[toast.type] || icons.info}
          <div className="flex-1 text-sm text-text-primary">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-text-muted hover:text-text-primary p-0.5"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
