import React, { useEffect, useState } from 'react';
import { sheltersApi } from '../lib/api/endpoints';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Home, Users, CheckCircle2, PhoneCall, MapPin, Accessibility, RefreshCw } from 'lucide-react';

export const Shelters = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessibleOnly, setAccessibleOnly] = useState(false);

  const fetchShelters = async () => {
    setLoading(true);
    try {
      const params = {};
      if (accessibleOnly) params.accessible_only = true;
      const res = await sheltersApi.list(params);
      setShelters(res.data);
    } catch (err) {
      console.warn('Failed to load shelters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, [accessibleOnly]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary mb-2">
            Designated <span className="gradient-text">Evacuation Centers & Relief Camps</span>
          </h1>
          <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
            Officially sanctioned refuge facilities equipped with sanitation, emergency rations, and first aid during flash floods, cyclones, and industrial emergencies.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary cursor-pointer bg-surface border border-border px-3 py-1.5 rounded-lg select-none">
            <input
              type="checkbox"
              checked={accessibleOnly}
              onChange={(e) => setAccessibleOnly(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            <Accessibility className="w-3.5 h-3.5 text-accent" />
            <span>Wheelchair Accessible</span>
          </label>

          <Button variant="secondary" size="sm" onClick={fetchShelters} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Shelter Grid */}
      {loading ? (
        <Spinner size="lg" className="my-16" />
      ) : shelters.length === 0 ? (
        <EmptyState
          title="No shelters available"
          description="No evacuation centers currently match your filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shelters.map((s) => {
            const occupancyPct = s.total_capacity
              ? Math.min(100, Math.round((s.current_occupancy / s.total_capacity) * 100))
              : 0;

            return (
              <Card key={s.id} className="p-6 flex flex-col justify-between" hover>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-success bg-success/15 border border-success/30 px-2 py-0.5 rounded-full uppercase">
                      {s.status}
                    </span>
                    {s.is_accessible && (
                      <span className="text-[10px] font-bold text-accent bg-accent/15 border border-accent/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Accessibility className="w-3 h-3" /> Accessible
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-text-primary mb-1">
                    {s.name}
                  </h3>
                  <p className="text-xs text-text-secondary flex items-start gap-1.5 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                    <span>{s.address}, {s.district}</span>
                  </p>

                  {/* Occupancy bar */}
                  <div className="mb-4 p-3 rounded-lg bg-surface-2/60 border border-border/40">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-text-muted">Occupancy:</span>
                      <span className="font-bold text-text-primary">
                        {s.current_occupancy} / {s.total_capacity || 'N/A'} ({occupancyPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all rounded-full ${
                          occupancyPct > 85 ? 'bg-danger' : occupancyPct > 50 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  {s.amenities && s.amenities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                        Provided Amenities
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {s.amenities.map((item, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border/80 text-text-secondary"
                          >
                            ✓ {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs">
                  <div className="truncate">
                    <p className="text-[10px] text-text-muted">Camp In-Charge</p>
                    <p className="font-semibold text-text-primary truncate">{s.contact_person || 'Disaster Cell'}</p>
                  </div>
                  {s.contact_phone && (
                    <a
                      href={`tel:${s.contact_phone}`}
                      className="px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary text-primary-light hover:text-white font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      Call Camp
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
