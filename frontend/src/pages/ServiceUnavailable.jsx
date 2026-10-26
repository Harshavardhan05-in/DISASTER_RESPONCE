import React from 'react';
import { Button } from '../components/ui/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ServiceUnavailable = () => {
  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-md">
      <div className="w-16 h-16 rounded-2xl bg-warning/15 text-warning mx-auto flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-text-primary mb-2">503</h1>
      <h2 className="text-xl font-bold text-text-primary mb-3">Service Temporarily Unavailable</h2>
      <p className="text-xs text-text-secondary leading-relaxed mb-8">
        The backend coordination service is experiencing heavy load or undergoing critical maintenance. Local cached emergency numbers remain active: dial 112 directly.
      </p>
      <Button variant="secondary" onClick={() => window.location.reload()} leftIcon={<RefreshCw className="w-4 h-4" />}>
        Retry Connection
      </Button>
    </div>
  );
};
