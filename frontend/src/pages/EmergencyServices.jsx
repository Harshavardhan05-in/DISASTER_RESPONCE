import React, { useEffect, useState } from 'react';
import { emergencyApi } from '../lib/api/endpoints';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import {
  PhoneCall, Shield, Flame, Activity, Building2,
  Clock, MapPin, Search, AlertCircle
} from 'lucide-react';

export const EmergencyServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedType) params.service_type = selectedType;
      if (searchQuery) params.search = searchQuery;

      const res = await emergencyApi.listServices(params);
      setServices(res.data);
    } catch (err) {
      console.warn('Failed to fetch emergency services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedType, searchQuery]);

  const typeIcons = {
    fire: <Flame className="w-5 h-5 text-danger" />,
    hospital: <Activity className="w-5 h-5 text-accent" />,
    ambulance: <PhoneCall className="w-5 h-5 text-warning" />,
    disaster_mgmt: <Shield className="w-5 h-5 text-primary" />,
    other: <Shield className="w-5 h-5 text-accent" />,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-text-primary mb-2">
          Emergency Services & <span className="gradient-text">First Responders Directory</span>
        </h1>
        <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
          Verified direct emergency contact channels for Police Control, Disaster Response Forces, Fire Rescue, Trauma Centers, and Ambulances across Telangana and adjoining regions.
        </p>
      </div>

      {/* Prominent 112 Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-danger/20 via-surface to-surface border border-danger/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-danger flex items-center justify-center text-white shadow-lg shadow-danger/40">
            <PhoneCall className="w-7 h-7 animate-bounce" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-danger">National Unified Emergency</span>
            <h2 className="text-3xl font-extrabold text-white">Dial 112</h2>
            <p className="text-xs text-text-secondary">Single emergency number across India for Police, Fire, Ambulance, and Disaster Assistance.</p>
          </div>
        </div>
        <a
          href="tel:112"
          className="px-6 py-3 rounded-xl bg-danger hover:bg-danger-hover text-white font-extrabold text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
        >
          <PhoneCall className="w-4 h-4" /> Call 112 Now
        </a>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search service name, hospital, police station, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9 text-xs py-2 bg-surface"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="form-input text-xs py-2 bg-surface cursor-pointer"
          >
            <option value="">All Service Classifications</option>
            <option value="fire">Fire & Rescue Services</option>
            <option value="hospital">Hospitals & Trauma Care</option>
            <option value="ambulance">Ambulance Fleets (108)</option>
            <option value="disaster_mgmt">Disaster Response Forces (DRF)</option>
            <option value="other">Central Control Rooms</option>
          </select>
        </div>
      </div>

      {/* Services List */}
      {loading ? (
        <Spinner size="lg" className="my-16" />
      ) : services.length === 0 ? (
        <EmptyState
          title="No services match criteria"
          description="Try broadening your search term or selecting 'All Classifications'."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <Card key={svc.id} className="p-5 flex flex-col justify-between" hover>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-surface-2 border border-border w-fit">
                    {typeIcons[svc.service_type] || <Shield className="w-5 h-5 text-accent" />}
                  </div>
                  {svc.is_24_7 && (
                    <span className="text-[10px] font-bold text-success bg-success/15 border border-success/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 24/7 Active
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-text-primary mb-1">
                  {svc.name}
                </h3>

                <p className="text-xs text-text-secondary flex items-start gap-1.5 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                  <span>{svc.address}, {svc.district}</span>
                </p>
              </div>

              <div className="pt-4 border-t border-border/50 flex items-center justify-between gap-2">
                <div className="text-xs font-mono text-text-muted truncate">
                  {svc.phone_primary}
                </div>
                <a
                  href={`tel:${svc.phone_emergency || svc.phone_primary}`}
                  className="px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary text-primary-light hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call {svc.phone_emergency || svc.phone_primary}</span>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
