import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { incidentsApi } from '../../lib/api/endpoints';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Search, MapPin, Calendar, Clock, CheckCircle2,
  AlertCircle, ShieldCheck, FileText, Image as ImageIcon
} from 'lucide-react';

export const TrackIncident = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();

  const [inputRef, setInputRef] = useState(reportId || '');
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchIncident = async (ref) => {
    if (!ref) return;
    setLoading(true);
    setError('');
    try {
      const res = await incidentsApi.track(ref.trim());
      setIncident(res.data);
    } catch (err) {
      setIncident(null);
      setError(err.response?.data?.error?.message || `Incident report '${ref}' not found in registry.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportId) {
      fetchIncident(reportId);
    }
  }, [reportId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputRef) {
      navigate(`/track/${inputRef.trim()}`);
      fetchIncident(inputRef.trim());
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-3">
          Track <span className="gradient-text">Disaster Report</span>
        </h1>
        <p className="text-sm text-text-secondary">
          Enter your incident reference number (format: <code>DR360-YYYY-XXXXX</code>) to inspect live dispatch status and responder action history.
        </p>
      </div>

      {/* Search Bar */}
      <Card className="p-4 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Enter reference number (e.g. DR360-2026-FL001)"
              value={inputRef}
              onChange={(e) => setInputRef(e.target.value)}
              className="form-input pl-10 text-xs py-2.5 font-mono uppercase"
              required
            />
          </div>
          <Button type="submit" variant="primary" size="md" isLoading={loading} className="w-full sm:w-auto">
            Track Incident
          </Button>
        </form>
      </Card>

      {/* Result Display */}
      {loading ? (
        <Spinner size="lg" className="my-16" />
      ) : error ? (
        <EmptyState
          icon={AlertCircle}
          title="Incident Record Not Found"
          description={error}
        />
      ) : incident ? (
        <div className="space-y-8 animate-fade-in">
          {/* Main Summary Card */}
          <Card className="p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-extrabold px-3 py-1 rounded bg-surface-2 border border-border text-accent">
                  {incident.reference_number}
                </span>
                <Badge severity={incident.severity}>{incident.severity}</Badge>
                <Badge status={incident.status}>{incident.status}</Badge>
              </div>

              <div className="text-xs text-text-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Logged: {new Date(incident.reported_at).toLocaleString()}</span>
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-3">
              {incident.title}
            </h2>

            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              {incident.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs p-4 rounded-xl bg-surface-2/40 border border-border/40">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                  Location & Address
                </p>
                <p className="text-text-primary flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>{incident.address || 'Address coordinates recorded'}, {incident.district}, {incident.state}</span>
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                  Hazard Classification
                </p>
                <p className="text-text-primary font-semibold uppercase">
                  {incident.category}
                </p>
              </div>
            </div>

            {/* Evidence photos if any */}
            {incident.evidence && incident.evidence.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-accent" /> Submitted Evidence ({incident.evidence.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {incident.evidence.map((ev) => (
                    <a
                      key={ev.id}
                      href={ev.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-lg overflow-hidden border border-border bg-surface-2 p-1 hover:border-primary transition-colors"
                    >
                      <div className="h-24 bg-surface flex items-center justify-center text-xs text-text-muted group-hover:text-primary">
                        <ImageIcon className="w-6 h-6 mb-1" />
                      </div>
                      <p className="text-[10px] text-text-muted truncate mt-1 px-1">
                        {ev.original_filename}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Chronological Status History Timeline */}
          <Card className="p-8">
            <h3 className="text-base font-bold text-text-primary mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              Operational Triage Timeline & Action Log
            </h3>

            {incident.status_history && incident.status_history.length > 0 ? (
              <div className="space-y-6 relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {incident.status_history.map((hist, i) => (
                  <div key={hist.id || i} className="relative">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface" />
                    <div className="text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold uppercase tracking-wider text-text-primary">
                          Status Transition: {hist.new_status.replace('_', ' ')}
                        </span>
                        <span className="text-text-muted">• {new Date(hist.changed_at).toLocaleString()}</span>
                      </div>
                      {hist.reason && (
                        <p className="p-2.5 rounded-lg bg-surface-2/60 border border-border/40 text-text-secondary mt-1">
                          {hist.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted">No status transitions recorded yet.</p>
            )}
          </Card>
        </div>
      ) : (
        <Card className="p-12 text-center text-text-muted">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Enter an incident reference number above to view its live response progress.</p>
        </Card>
      )}
    </div>
  );
};
