import React from 'react';
import { Card } from '../components/ui/Card';
import { Accessibility as AccessibilityIcon, Eye, Zap, Volume2, ShieldCheck } from 'lucide-react';

export const Accessibility = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-3">
          Accessibility <span className="gradient-text">Commitment</span>
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Disaster Response 360 is designed to adhere to Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards to ensure equal, unimpeded access during life-saving emergencies.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3 text-accent font-bold text-base">
            <Eye className="w-5 h-5" />
            <span>High Contrast & Never Color Alone</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Incident severities (Critical, High, Medium, Low) are always indicated by bold textual labels and distinct icons (flames, warning signs, information discs), never by color coding alone. Color tokens meet a minimum 4.5:1 contrast ratio against the Midnight Aurora background.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3 text-primary-light font-bold text-base">
            <Zap className="w-5 h-5" />
            <span>Reduced Motion Support</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            All 3D WebGL rotation, pulsing radar animations, and slide-in transitions honor the operating system's <code>prefers-reduced-motion</code> setting, ensuring users prone to vestibular motion sickness can report incidents without discomfort.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3 text-success font-bold text-base">
            <AccessibilityIcon className="w-5 h-5" />
            <span>Keyboard Navigability & Screen Readers</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Every interactive control, map filter, and report wizard input can be fully traversed via standard keyboard tab sequences with prominent focus rings. All forms provide ARIA labels, live error announcements, and accessible modal traps.
          </p>
        </Card>
      </div>
    </div>
  );
};
