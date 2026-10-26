import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Shield, Map, AlertTriangle, Home, Users, BarChart, Phone, UploadCloud } from 'lucide-react';

export const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: AlertTriangle,
      title: 'Disaster Incident Reporting',
      desc: 'Submit geolocated hazard reports covering 14 hazard types (Flooding, Cyclones, Heatwaves, Building Collapse, Chemical Leaks) with photo/video evidence.',
      action: 'Report Now',
      path: '/report',
    },
    {
      icon: Map,
      title: 'Real-time Geospatial Situational Map',
      desc: 'Interactive MapLibre GL map showing verified incidents, official warning regions, and designated evacuation centers across India.',
      action: 'View Map',
      path: '/situation',
    },
    {
      icon: Shield,
      title: 'Official Alerts & Weather Watches',
      desc: 'Harmonized early warning alerts ingested from IMD, NDMA, and State Disaster Management Authorities with severity classifications.',
      action: 'View Alerts',
      path: '/alerts',
    },
    {
      icon: Home,
      title: 'Shelter & Evacuation Management',
      desc: 'Directory of approved relief camps with real-time occupancy tracking, capacity limits, accessibility amenities, and camp officer contact info.',
      action: 'Find Shelters',
      path: '/shelters',
    },
    {
      icon: Phone,
      title: 'Emergency Services Directory',
      desc: 'Verified one-tap direct calling for Police (112), Fire (101), Ambulance (108), Disaster Response Force (DRF), and trauma care hospitals.',
      action: 'Browse Contacts',
      path: '/emergency-services',
    },
    {
      icon: Users,
      title: 'NGO & Volunteer Coordination',
      desc: 'Mobilize registered volunteer teams with verified skills (medical first aid, rescue boat operations, relief ration delivery).',
      action: 'Get Involved',
      path: '/volunteer',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-4">
          Emergency Services & <span className="gradient-text">Capabilities</span>
        </h1>
        <p className="text-base text-text-secondary leading-relaxed">
          Disaster Response 360 provides an end-to-end operational suite spanning public warning, field reporting, resource warehousing, and rescue coordination.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="p-6 flex flex-col justify-between" hover>
              <div>
                <div className="p-3 rounded-xl bg-primary/10 text-primary-light w-fit mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{item.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-6">{item.desc}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate(item.path)} className="w-full">
                {item.action}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
