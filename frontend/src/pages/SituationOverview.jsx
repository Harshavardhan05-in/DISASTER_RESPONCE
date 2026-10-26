import React, { useEffect, useState } from 'react';
import { IncidentMap } from '../features/maps/IncidentMap';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { incidentsApi, sheltersApi } from '../lib/api/endpoints';
import { Filter, MapPin, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SituationOverview = () => {
  const [incidents, setIncidents] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedSeverity) params.severity = selectedSeverity;

      const [incRes, shelterRes] = await Promise.allSettled([
        incidentsApi.list(params),
        sheltersApi.list(),
      ]);

      if (incRes.status === 'fulfilled') setIncidents(incRes.value.data);
      if (shelterRes.status === 'fulfilled') setShelters(shelterRes.value.data);
    } catch (e) {
      console.error('Failed to fetch situation data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedSeverity]);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'flooding', label: 'Flooding' },
    { value: 'cyclone', label: 'Cyclone / Storm' },
    { value: 'heat', label: 'Extreme Heat' },
    { value: 'fire', label: 'Fire' },
    { value: 'building_collapse', label: 'Building Collapse' },
    { value: 'earthquake', label: 'Earthquake' },
  ];

  const severities = [
    { value: '', label: 'All Severities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Live Tactical <span className="gradient-text">Situation Overview</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Real-time geospatial observation of active hazard reports, SDRF dispatches, and emergency shelter capacities.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-input text-xs py-1.5 px-3 bg-surface w-auto"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="form-input text-xs py-1.5 px-3 bg-surface w-auto"
          >
            {severities.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <Button variant="secondary" size="sm" onClick={fetchData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Grid: Map & Incident Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map View */}
        <div className="lg:col-span-8">
          <IncidentMap
            incidents={incidents}
            shelters={shelters}
            className="h-[600px] w-full"
            onSelectIncident={(inc) => setSelectedIncident(inc)}
          />
        </div>

        {/* Incident List Sidebar */}
        <div className="lg:col-span-4 h-[600px] flex flex-col bg-surface border border-border rounded-xl p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
            <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              Incidents ({incidents.length})
            </h3>
            <span className="text-[11px] text-text-muted">Ordered by recency</span>
          </div>

          {loading ? (
            <Spinner className="my-auto" />
          ) : incidents.length === 0 ? (
            <EmptyState
              title="No active incidents"
              description="No reports match your active filters."
              className="my-auto"
            />
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedIncident?.id === inc.id
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border/60 bg-surface-2/40 hover:border-border hover:bg-surface-2'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge severity={inc.severity}>{inc.severity}</Badge>
                    <span className="font-mono text-[10px] text-text-muted">{inc.reference_number}</span>
                  </div>

                  <h4 className="font-bold text-xs text-text-primary line-clamp-1 mb-1">
                    {inc.title}
                  </h4>

                  <div className="flex items-center justify-between text-[10px] text-text-muted mt-2 pt-2 border-t border-border/30">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-accent" />
                      {inc.district || 'Location Pending'}
                    </span>
                    <Link
                      to={`/track/${inc.reference_number}`}
                      className="text-primary-light hover:text-accent font-semibold"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Track Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
