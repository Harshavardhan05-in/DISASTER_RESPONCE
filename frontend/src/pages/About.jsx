import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ShieldAlert, Target, Database, Lock, Eye, AlertOctagon } from 'lucide-react';

export const About = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Header */}
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-4">
          About <span className="gradient-text">Disaster Response 360</span>
        </h1>
        <p className="text-base text-text-secondary leading-relaxed">
          An integrated platform built to modernize emergency response, accelerate disaster relief logistics, and deliver verified public early warnings.
        </p>
      </div>

      {/* Operational Disclaimer Alert */}
      <div className="mb-12 p-6 rounded-2xl border border-warning/30 bg-warning/5 flex items-start gap-4">
        <AlertOctagon className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
        <div className="text-sm">
          <h4 className="font-bold text-text-primary mb-1">Development & Demonstration Deployment Notice</h4>
          <p className="text-text-secondary leading-relaxed">
            This instance is an engineering deployment. It is not an officially designated emergency service or replacement for state or national disaster authorities. In any real emergency, please immediately dial India's unified emergency number <strong className="text-danger font-bold">112</strong>.
          </p>
        </div>
      </div>

      {/* Core Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Card className="p-6">
          <div className="p-3 bg-primary/10 text-primary-light rounded-xl w-fit mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Our Mission</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            To eliminate the information fog during major climate and industrial catastrophes. By bridging citizen crowd reports with official meteorological alerts and shelter logistics, we help rescue personnel save lives and allocate scarce relief resources where they are needed most.
          </p>
        </Card>

        <Card className="p-6">
          <div className="p-3 bg-accent/10 text-accent rounded-xl w-fit mb-4">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Open Data Principles</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            We prioritize open-source technologies, OpenStreetMap geospatial tiles, and open meteorological observations via Open-Meteo. Official warnings are ingested through standardized Common Alerting Protocol (CAP) standards as defined by NDMA and IMD.
          </p>
        </Card>
      </div>

      {/* Platform Pillars */}
      <div className="space-y-6 mb-16">
        <h2 className="text-2xl font-bold text-text-primary">Key Architectural Pillars</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5">
            <h4 className="font-bold text-text-primary mb-1">1. Incident Triage</h4>
            <p className="text-xs text-text-secondary">
              Strict status transition state machine (Submitted → Review → Acknowledged → Assigned → Resolved) prevents duplicate dispatching.
            </p>
          </Card>

          <Card className="p-5">
            <h4 className="font-bold text-text-primary mb-1">2. Geospatial Clustering</h4>
            <p className="text-xs text-text-secondary">
              MapLibre GL WebGL maps display incident markers, high-water zones, and verified shelter locations without slow tile rendering.
            </p>
          </Card>

          <Card className="p-5">
            <h4 className="font-bold text-text-primary mb-1">3. Privacy & Integrity</h4>
            <p className="text-xs text-text-secondary">
              Citizen reporters can report anonymously or with encrypted contacts. Public maps blur exact private residences to neighborhood quadrants.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
