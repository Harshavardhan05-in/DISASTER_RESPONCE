import React from 'react';
import { Card } from '../components/ui/Card';
import { ShieldCheck, Lock, MapPin, EyeOff } from 'lucide-react';

export const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-3">
          Privacy & <span className="gradient-text">Data Protection Policy</span>
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          How Disaster Response 360 secures citizen reporter information, handles geographic coordinates, and preserves confidentiality.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 font-bold text-base text-accent">
            <Lock className="w-5 h-5" />
            <span>1. Reporter Personally Identifiable Information (PII)</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            When submitting disaster incident reports, citizens may choose to report anonymously. When contact information (phone number or name) is provided, it is stored securely and accessible only to authorized emergency dispatch controllers with verified role credentials. It is never exposed in public API responses or public map overlays.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 font-bold text-base text-primary-light">
            <MapPin className="w-5 h-5" />
            <span>2. Geolocation Precision</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            GPS coordinates provided during report submission are used exclusively to direct first responder rescue teams and assess local flood/cyclone damage. In public views, coordinates are aggregated to neighborhood levels to prevent pinpointing private residences.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 font-bold text-base text-success">
            <ShieldCheck className="w-5 h-5" />
            <span>3. Auditability & Retention</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Access to sensitive disaster data is audited in an append-only audit trail. Incident records are archived in compliance with disaster management operational regulations for historical after-action review.
          </p>
        </Card>
      </div>
    </div>
  );
};
