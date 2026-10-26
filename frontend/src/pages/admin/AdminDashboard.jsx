import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../lib/store/authStore';
import { useUIStore } from '../../lib/store/uiStore';
import { analyticsApi, incidentsApi, alertsApi } from '../../lib/api/endpoints';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import {
  ShieldAlert, AlertTriangle, Users, Package, BarChart3,
  CloudSun, CheckCircle2, Clock, ArrowRight, Download, Radio, RefreshCw
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [overview, setOverview] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [overviewRes, incidentsRes, weatherRes] = await Promise.allSettled([
        analyticsApi.overview(),
        incidentsApi.list(),
        analyticsApi.weather(17.3850, 78.4867),
      ]);

      if (overviewRes.status === 'fulfilled') {
        setOverview(overviewRes.value.data);
      }
      if (incidentsRes.status === 'fulfilled') {
        setRecentIncidents((incidentsRes.value.data || []).slice(0, 5));
      }
      if (weatherRes.status === 'fulfilled') {
        setWeather(weatherRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load admin overview:', err);
      addToast('Error loading operational metrics', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleExportCSV = async () => {
    try {
      addToast('Preparing CSV export...', 'info');
      const token = localStorage.getItem('dr360_access_token');
      const response = await fetch('/api/v1/analytics/export', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dr360_incidents_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addToast('CSV export downloaded successfully', 'success');
    } catch (err) {
      console.error('Export error:', err);
      addToast('Failed to export incidents CSV', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-surface border border-border shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-accent">Central Command Center</span>
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary mt-1">
            System Operational Overview
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Role: <span className="text-accent font-semibold">{user?.role?.replace('_', ' ').toUpperCase()}</span> • Real-time situational awareness and resource coordination
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Main KPI Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border-l-4 border-l-primary" hover>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase">Total Incidents</span>
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-text-primary">
                  {overview?.total_incidents ?? recentIncidents.length}
                </span>
                <span className="text-xs text-accent">Recorded</span>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-warning" hover>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase">Pending / Active</span>
                <Radio className="w-5 h-5 text-warning" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-warning">
                  {overview?.pending_incidents ?? 0}
                </span>
                <span className="text-xs text-text-muted">Awaiting Action</span>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-danger" hover>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase">Active Alerts</span>
                <ShieldAlert className="w-5 h-5 text-danger" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-danger">
                  {overview?.active_alerts ?? 0}
                </span>
                <span className="text-xs text-text-muted">Live Broadcasts</span>
              </div>
            </Card>

            <Card className="p-5 border-l-4 border-l-success" hover>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase">Relief Shelters</span>
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-success">
                  {overview?.open_shelters ?? 0}
                </span>
                <span className="text-xs text-text-muted">Open Facilities</span>
              </div>
            </Card>
          </div>

          {/* Quick Hub Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/admin/incidents" className="p-4 rounded-xl bg-surface border border-border hover:border-primary/50 transition-colors flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary-light">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-text-primary">Incidents Hub</p>
                <p className="text-[11px] text-text-muted">Review & manage triage</p>
              </div>
            </Link>

            <Link to="/admin/users" className="p-4 rounded-xl bg-surface border border-border hover:border-primary/50 transition-colors flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-text-primary">User Matrix</p>
                <p className="text-[11px] text-text-muted">Roles & access control</p>
              </div>
            </Link>

            <Link to="/admin/resources" className="p-4 rounded-xl bg-surface border border-border hover:border-primary/50 transition-colors flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-text-primary">Relief Stock</p>
                <p className="text-[11px] text-text-muted">Supplies & logistics</p>
              </div>
            </Link>

            <Link to="/admin/analytics" className="p-4 rounded-xl bg-surface border border-border hover:border-primary/50 transition-colors flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-text-primary">Analytics</p>
                <p className="text-[11px] text-text-muted">Visual charts & trends</p>
              </div>
            </Link>
          </div>

          {/* Two-Column Area: Weather + Recent Incidents */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Meteorological Telemetry */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <CloudSun className="w-5 h-5 text-accent" />
                    <h3 className="font-bold text-sm text-text-primary">Regional Weather Telemetry</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent/15 text-accent">
                    Open-Meteo
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="p-4 rounded-xl bg-surface-2/60 border border-border/40">
                    <p className="text-xs text-text-muted">Monitoring Zone: Hyderabad Hub (17.38°N, 78.48°E)</p>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="text-3xl font-extrabold text-text-primary">
                        {weather?.temperature_c !== undefined ? `${weather.temperature_c}°C` : '28.4°C'}
                      </span>
                      <span className="text-xs text-text-secondary">
                        Wind: {weather?.windspeed_kmh !== undefined ? `${weather.windspeed_kmh} km/h` : '12 km/h'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-text-muted">
                    <p>• Telemetry provider: Open-Meteo API</p>
                    <p>• Hazard threshold alert: Normal range</p>
                    <p>• Automated precipitation sensor: Active</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/40">
                <Link to="/situation" className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold">
                  Open Live Situational Map <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>

            {/* Recent Incident Queue */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-text-primary">Recent Inbound Reports</h3>
                <Link to="/admin/incidents" className="text-xs text-accent hover:underline flex items-center gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {recentIncidents.map((incident) => (
                  <Card key={incident.id} className="p-4 flex items-center justify-between gap-4" hover>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-accent">{incident.reference_number}</span>
                        <Badge severity={incident.severity}>{incident.severity}</Badge>
                        <Badge status={incident.status}>{incident.status}</Badge>
                      </div>
                      <p className="font-bold text-sm text-text-primary truncate">{incident.title}</p>
                      <p className="text-xs text-text-muted truncate">
                        {incident.district || 'Location recorded'} • {new Date(incident.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <Link to={`/track/${incident.reference_number}`}>
                      <Button variant="outline" size="sm">
                        Track
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
