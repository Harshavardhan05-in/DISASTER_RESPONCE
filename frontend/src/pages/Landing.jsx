import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert, PhoneCall, PlusCircle, ArrowRight, Activity, CheckCircle2,
  Users, Home, AlertTriangle, CloudRain, Flame, Wind, HeartHandshake, Eye
} from 'lucide-react';
import { GlobeScene } from '../features/maps/GlobeScene';
import { IncidentMap } from '../features/maps/IncidentMap';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { analyticsApi, incidentsApi, alertsApi } from '../lib/api/endpoints';

export const Landing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_incidents: 4,
    active_incidents: 3,
    resolved_incidents: 1,
    active_alerts: 2,
    total_shelters: 3,
  });
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, incidentsRes, alertsRes] = await Promise.allSettled([
          analyticsApi.overview(),
          incidentsApi.list({ page_size: 4 }),
          alertsApi.list({ page_size: 2 }),
        ]);

        if (overviewRes.status === 'fulfilled') setStats(overviewRes.value.data);
        if (incidentsRes.status === 'fulfilled') setRecentIncidents(incidentsRes.value.data);
        if (alertsRes.status === 'fulfilled') setActiveAlerts(alertsRes.value.data);
      } catch (err) {
        console.warn('Landing data fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-24">
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-4.5rem)] flex items-center justify-center overflow-hidden pt-8 pb-16">
        {/* Ambient Glow Backdrops */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-[128px] pointer-events-none" />

        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-semibold text-text-secondary w-fit shadow-md">
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              <span>National Disaster Early Warning & Incident Management</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.1]">
              Rapid Response. <br />
              <span className="gradient-text">Coordinated Relief.</span> <br />
              Resilient Communities.
            </h1>

            <p className="text-base md:text-lg text-text-secondary max-w-xl leading-relaxed">
              Disaster Response 360 unifies distress reporting, official IMD/NDMA warning dissemination, real-time geographic clustering, and relief logistics across India.
            </p>

            {/* Emergency Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate('/report')}
                leftIcon={<PlusCircle className="w-5 h-5" />}
                className="shadow-xl shadow-primary/30 font-bold"
              >
                {t('report_incident')}
              </Button>

              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/situation')}
                leftIcon={<Activity className="w-5 h-5 text-accent" />}
              >
                {t('live_situation')}
              </Button>

              <a
                href="tel:112"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-danger/15 border border-danger/40 text-danger font-bold text-base hover:bg-danger hover:text-white transition-all shadow-md"
              >
                <PhoneCall className="w-5 h-5 animate-bounce" />
                <span>Call 112 SOS</span>
              </a>
            </div>

            {/* Track ID quick bar */}
            <div className="flex items-center gap-3 pt-4 border-t border-border/60 max-w-lg">
              <span className="text-xs text-text-muted whitespace-nowrap">Track Report:</span>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const ref = e.target.elements.refId.value.trim();
                  if (ref) navigate(`/track/${ref}`);
                }}
                className="flex items-center gap-2 w-full"
              >
                <input
                  name="refId"
                  placeholder="e.g. DR360-2026-FL001"
                  className="form-input text-xs py-1.5 font-mono"
                  required
                />
                <Button type="submit" variant="outline" size="sm">
                  Track
                </Button>
              </form>
            </div>
          </div>

          {/* Right Hero 3D Globe Scene */}
          <div className="lg:col-span-5 h-[450px] md:h-[500px] flex items-center justify-center relative">
            <div className="w-full h-full relative">
              <GlobeScene />
              <div className="absolute bottom-2 right-2 glass px-3 py-1.5 rounded-lg text-[10px] text-text-muted border border-border flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                <span>3D Geographic Spatial Matrix (WebGL)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Real-Time Statistics Strip ────────────────────────────────────────── */}
      <section className="container mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-surface border border-border shadow-2xl glass">
          <div className="text-center p-3">
            <p className="text-2xl md:text-4xl font-extrabold text-accent">
              {stats.total_incidents || 0}
            </p>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">
              Incidents Logged
            </p>
          </div>
          <div className="text-center p-3 border-l border-border/50">
            <p className="text-2xl md:text-4xl font-extrabold text-danger">
              {stats.active_incidents || 0}
            </p>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">
              Active Triage
            </p>
          </div>
          <div className="text-center p-3 border-l border-border/50">
            <p className="text-2xl md:text-4xl font-extrabold text-success">
              {stats.resolved_incidents || 0}
            </p>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">
              Resolved Safely
            </p>
          </div>
          <div className="text-center p-3 border-l border-border/50">
            <p className="text-2xl md:text-4xl font-extrabold text-primary-light">
              {stats.total_shelters || 0}
            </p>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mt-1">
              Verified Shelters
            </p>
          </div>
        </div>
      </section>

      {/* ─── Live Situation & Official Alerts ──────────────────────────────────── */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent mb-2">
              <Activity className="w-4 h-4" />
              <span>Situational Awareness</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
              Live Incidents & Geospatial Map
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/situation')} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Open Full Tactical Map
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Map Component */}
          <div className="lg:col-span-8">
            <IncidentMap
              incidents={recentIncidents}
              className="h-[460px]"
              onSelectIncident={(inc) => navigate(`/track/${inc.reference_number}`)}
            />
          </div>

          {/* Active Alerts Panel */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                Active Early Warnings
              </h3>
              <Link to="/alerts" className="text-xs text-primary-light hover:text-accent">
                View All
              </Link>
            </div>

            {activeAlerts.length > 0 ? (
              activeAlerts.map((alert) => (
                <Card key={alert.id} className="p-4" hover>
                  <div className="flex items-center justify-between mb-2">
                    <Badge severity={alert.severity}>{alert.severity}</Badge>
                    <span className="text-[10px] text-text-muted">
                      {new Date(alert.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-text-primary line-clamp-2 mb-1">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-text-secondary line-clamp-3 mb-3">
                    {alert.description}
                  </p>
                  <div className="text-[11px] text-text-muted flex items-center justify-between border-t border-border/40 pt-2">
                    <span>Source: {alert.issuing_authority || alert.source.toUpperCase()}</span>
                    <span className="text-accent font-semibold">{alert.district || 'Regional'}</span>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-text-secondary">
                <p className="text-sm">No active emergency alerts currently issued.</p>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* ─── How Platform Works ────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
            {t('how_it_works')}
          </h2>
          <p className="text-sm text-text-secondary">
            Engineered with strict triage protocols to turn raw citizen distress signals into prioritized field dispatch orders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 relative" hover>
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary-light flex items-center justify-center font-bold text-base mb-4">
              1
            </div>
            <h4 className="text-base font-bold text-text-primary mb-2">{t('step1_title')}</h4>
            <p className="text-xs text-text-secondary leading-relaxed">{t('step1_desc')}</p>
          </Card>

          <Card className="p-6 relative" hover>
            <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold text-base mb-4">
              2
            </div>
            <h4 className="text-base font-bold text-text-primary mb-2">{t('step2_title')}</h4>
            <p className="text-xs text-text-secondary leading-relaxed">{t('step2_desc')}</p>
          </Card>

          <Card className="p-6 relative" hover>
            <div className="w-10 h-10 rounded-xl bg-warning/20 text-warning flex items-center justify-center font-bold text-base mb-4">
              3
            </div>
            <h4 className="text-base font-bold text-text-primary mb-2">{t('step3_title')}</h4>
            <p className="text-xs text-text-secondary leading-relaxed">{t('step3_desc')}</p>
          </Card>

          <Card className="p-6 relative" hover>
            <div className="w-10 h-10 rounded-xl bg-success/20 text-success flex items-center justify-center font-bold text-base mb-4">
              4
            </div>
            <h4 className="text-base font-bold text-text-primary mb-2">{t('step4_title')}</h4>
            <p className="text-xs text-text-secondary leading-relaxed">{t('step4_desc')}</p>
          </Card>
        </div>
      </section>

      {/* ─── Stakeholder Pathways ──────────────────────────────────────────────── */}
      <section className="container mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            Multi-Tier Stakeholder Portals
          </h2>
          <p className="text-xs text-text-secondary">
            Role-based access designed for citizens, authorized response personnel, humanitarian NGOs, and registered volunteer coordinators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 flex flex-col justify-between" hover>
            <div>
              <div className="p-3 bg-primary/10 text-primary-light rounded-xl w-fit mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-text-primary mb-1">Citizens</h4>
              <p className="text-xs text-text-secondary mb-6">
                Report disasters anonymously or authenticated, find nearest shelters, dial 112, and track report status in real time.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/report')} className="w-full">
              Report Hazard
            </Button>
          </Card>

          <Card className="p-6 flex flex-col justify-between" hover>
            <div>
              <div className="p-3 bg-danger/10 text-danger rounded-xl w-fit mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-text-primary mb-1">Responders</h4>
              <p className="text-xs text-text-secondary mb-6">
                Receive dispatched tactical assignments, view live incident clusters, upload evidence, and update status from the field.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/responder')} className="w-full">
              Responder Console
            </Button>
          </Card>

          <Card className="p-6 flex flex-col justify-between" hover>
            <div>
              <div className="p-3 bg-accent/10 text-accent rounded-xl w-fit mb-4">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-text-primary mb-1">NGOs & Relief</h4>
              <p className="text-xs text-text-secondary mb-6">
                Coordinate warehouse relief inventory (water, food kits, boats), verify organization accreditation, and deploy aid.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/ngos')} className="w-full">
              NGO Network
            </Button>
          </Card>

          <Card className="p-6 flex flex-col justify-between" hover>
            <div>
              <div className="p-3 bg-warning/10 text-warning rounded-xl w-fit mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-text-primary mb-1">Volunteers</h4>
              <p className="text-xs text-text-secondary mb-6">
                Register skills (first aid, boat handling, translations), update availability, and respond when emergency tasks arise.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/volunteer')} className="w-full">
              Join Volunteers
            </Button>
          </Card>
        </div>
      </section>

      {/* ─── Bottom CTA ────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-8">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-surface to-surface-2 border border-border text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary mb-3">
              Witnessing a Disaster or in Urgent Need of Rescue?
            </h2>
            <p className="text-sm text-text-secondary max-w-lg mx-auto mb-8">
              Immediate submissions are logged directly into the operations console for rapid verification and dispatch.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" variant="primary" onClick={() => navigate('/report')}>
                Submit Emergency Report
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/emergency-services')}>
                Directory of Emergency Services
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
