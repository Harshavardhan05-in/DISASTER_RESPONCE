import React, { useEffect, useState } from 'react';
import { alertsApi, analyticsApi } from '../lib/api/endpoints';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import {
  AlertTriangle, CloudRain, Wind, Thermometer, ExternalLink,
  ShieldCheck, RefreshCw, Calendar, Clock
} from 'lucide-react';

export const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('');

  const fetchAlertsAndWeather = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterSeverity) params.severity = filterSeverity;

      const [alertsRes, weatherRes] = await Promise.allSettled([
        alertsApi.list(params),
        analyticsApi.weather(17.3850, 78.4867),
      ]);

      if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.data);
      if (weatherRes.status === 'fulfilled') setWeather(weatherRes.value.data);
    } catch (err) {
      console.warn('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsAndWeather();
  }, [filterSeverity]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary">
            Official <span className="gradient-text">Early Warnings</span> & Alerts
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Harmonized bulletins from IMD (India Meteorological Department), NDMA, and State Disaster Management Authorities.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-3">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="form-input text-xs py-1.5 px-3 bg-surface w-auto"
          >
            <option value="">All Alert Levels</option>
            <option value="warning">Warning / Orange Alert</option>
            <option value="advisory">Advisory / Yellow Alert</option>
            <option value="emergency">Emergency / Red Alert</option>
          </select>

          <Button variant="secondary" size="sm" onClick={fetchAlertsAndWeather} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Weather Strip Card */}
      {weather && weather.status === 'live' && (
        <div className="mb-8 p-4 rounded-xl border border-accent/30 bg-accent/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-accent/15 text-accent">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted">Live Meteorological Observation</p>
              <p className="text-sm font-bold text-text-primary">Hyderabad Region (17.38°N, 78.48°E)</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-warning" />
              <span><strong>{weather.temperature_c}°C</strong> Temperature</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-accent" />
              <span><strong>{weather.windspeed_kmh} km/h</strong> Wind Speed</span>
            </div>
            <span className="text-[10px] text-text-muted">{weather.attribution}</span>
          </div>
        </div>
      )}

      {/* Alerts Grid */}
      {loading ? (
        <Spinner size="lg" className="my-16" />
      ) : alerts.length === 0 ? (
        <EmptyState
          title="No active warnings"
          description="There are currently no active weather watches or disaster alerts in this jurisdiction."
        />
      ) : (
        <div className="space-y-6">
          {alerts.map((alert) => (
            <Card key={alert.id} className="p-6 border-l-4 border-l-warning" hover>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Badge severity={alert.severity}>{alert.severity}</Badge>
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    {alert.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Issued: {new Date(alert.issued_at).toLocaleDateString()}
                  </span>
                  {alert.expires_at && (
                    <span className="flex items-center gap-1 text-danger">
                      <Clock className="w-3.5 h-3.5" />
                      Valid until: {new Date(alert.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold text-text-primary mb-2">
                {alert.title}
              </h3>

              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                {alert.description}
              </p>

              <div className="p-3 rounded-lg bg-surface-2/60 border border-border/40 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <strong className="text-text-primary">Affected Area: </strong>
                  <span className="text-text-secondary">{alert.affected_area || 'District wide'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted">Authority: {alert.issuing_authority || 'Disaster Management Division'}</span>
                  {alert.source_url && (
                    <a
                      href={alert.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-accent hover:underline font-semibold"
                    >
                      Official Source <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
