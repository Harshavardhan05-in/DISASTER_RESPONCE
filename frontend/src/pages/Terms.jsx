import React from 'react';
import { Card } from '../components/ui/Card';
import { FileText, AlertOctagon, Scale } from 'lucide-react';

export const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-3">
          Terms of <span className="gradient-text">Use</span>
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Operational terms governing access to and reporting through Disaster Response 360.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 font-bold text-base text-warning">
            <AlertOctagon className="w-5 h-5" />
            <span>1. Emergency Disclaimer</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Disaster Response 360 is an emergency coordination and situational platform. The platform does not guarantee instant rescue or emergency intervention. In situations presenting imminent danger to human life or property, you must contact emergency services by dialing 112 directly.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 font-bold text-base text-accent">
            <Scale className="w-5 h-5" />
            <span>2. Truthful Submissions & Hoax Prevention</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Users must submit truthful, bona fide incident information. Fabricating disaster reports, submitting misleading photographs, or deliberately overloading emergency coordination networks is strictly prohibited and subject to legal prosecution under disaster management laws.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2 font-bold text-base text-primary-light">
            <FileText className="w-5 h-5" />
            <span>3. Intellectual Property & Open Data Attribution</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Geographic map tiles are provided under the OpenStreetMap contributor license. Meteorological observations are powered by Open-Meteo. Official alerts are subject to the policies of the respective issuing authorities.
          </p>
        </Card>
      </div>
    </div>
  );
};
