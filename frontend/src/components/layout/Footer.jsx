import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, PhoneCall, ExternalLink, Heart, AlertOctagon } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-surface border-t border-border mt-20 pt-16 pb-12 text-sm text-text-secondary">
      <div className="container mx-auto px-4">
        {/* Top Emergency Disclaimer Strip */}
        <div className="mb-12 p-4 rounded-xl border border-warning/30 bg-warning/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 text-warning rounded-lg flex-shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-text-primary text-sm">
                Operational Notice & Emergency Disclaimer
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                This platform is in development. In an immediate life-threatening emergency, call India's unified emergency number <strong className="text-danger font-bold">112</strong> or local services directly.
              </p>
            </div>
          </div>
          <a
            href="tel:112"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-danger text-white text-xs font-bold hover:bg-danger-hover transition-colors shadow-md whitespace-nowrap"
          >
            <PhoneCall className="w-4 h-4" />
            Dial 112 Emergency
          </a>
        </div>

        {/* Multi-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Column 1: Identity */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent p-0.5 flex items-center justify-center shadow-md">
                <div className="w-full h-full bg-surface rounded-[10px] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-accent" />
                </div>
              </div>
              <span className="font-extrabold text-lg text-text-primary">
                DISASTER<span className="text-accent">360</span>
              </span>
            </div>
            <p className="text-text-secondary text-xs leading-relaxed max-w-sm mb-4">
              Disaster Response 360 is an integrated disaster management, public emergency reporting, early warning dissemination, and relief resource coordination platform engineered for national and district-level resilience.
            </p>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span>National Unified Portal</span>
              <span>•</span>
              <span>Open Geographic Core</span>
            </div>
          </div>

          {/* Column 2: Platform Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/situation" className="hover:text-accent transition-colors">Live Situation Map</Link></li>
              <li><Link to="/report" className="hover:text-accent transition-colors">Submit Hazard Report</Link></li>
              <li><Link to="/alerts" className="hover:text-accent transition-colors">Official Early Warnings</Link></li>
              <li><Link to="/track" className="hover:text-accent transition-colors">Track Incident Report</Link></li>
              <li><Link to="/services" className="hover:text-accent transition-colors">Platform Architecture</Link></li>
            </ul>
          </div>

          {/* Column 3: Emergency & Logistics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-4">
              Emergency & Shelters
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/emergency-services" className="hover:text-accent transition-colors">Emergency Directory</Link></li>
              <li><Link to="/shelters" className="hover:text-accent transition-colors">Evacuation Shelters</Link></li>
              <li><Link to="/safety" className="hover:text-accent transition-colors">Safety & Precautions</Link></li>
              <li><Link to="/ngos" className="hover:text-accent transition-colors">NGO Logistics Network</Link></li>
              <li><Link to="/volunteer" className="hover:text-accent transition-colors">Volunteer Responders</Link></li>
            </ul>
          </div>

          {/* Column 4: Trust & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-4">
              Governance & Policies
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/about" className="hover:text-accent transition-colors">About Disaster Response 360</Link></li>
              <li><Link to="/privacy" className="hover:text-accent transition-colors">Privacy & Data Protection</Link></li>
              <li><Link to="/terms" className="hover:text-accent transition-colors">Terms of Use</Link></li>
              <li><Link to="/accessibility" className="hover:text-accent transition-colors">Accessibility Standards</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Technical Support & Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Data Source Credits & Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div>
            © {new Date().getFullYear()} Disaster Response 360. Open-source disaster coordination platform.
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span>Map data © OpenStreetMap contributors</span>
            <span>•</span>
            <span>Weather by Open-Meteo</span>
            <span>•</span>
            <span>Early Warnings via IMD / NDMA Protocols</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
