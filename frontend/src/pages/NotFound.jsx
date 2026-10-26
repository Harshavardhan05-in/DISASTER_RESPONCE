import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { AlertCircle, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-24 text-center max-w-md">
      <div className="w-16 h-16 rounded-2xl bg-danger/15 text-danger mx-auto flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-text-primary mb-2">404</h1>
      <h2 className="text-xl font-bold text-text-primary mb-3">Resource Not Found</h2>
      <p className="text-xs text-text-secondary leading-relaxed mb-8">
        The disaster management page, report record, or emergency asset you are looking for does not exist or has been archived.
      </p>
      <Link to="/">
        <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
          Return to Headquarters
        </Button>
      </Link>
    </div>
  );
};
