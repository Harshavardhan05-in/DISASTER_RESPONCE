import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { CloudRain, Wind, Flame, Thermometer, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export const Safety = () => {
  const [activeTab, setActiveTab] = useState('flooding');

  const disasterGuides = {
    flooding: {
      title: 'Floods & Urban Inundation',
      icon: CloudRain,
      color: 'text-accent',
      before: [
        'Store 3 days of clean drinking water in sealed, elevated containers.',
        'Keep emergency documents in waterproof zip pouches.',
        'Locate the nearest designated relief camp and identify 2 evacuation routes.',
      ],
      during: [
        'Never walk, swim, or drive through flowing water. Just 6 inches of water can knock down an adult.',
        'Switch off main electricity fuses and gas cylinder valves before evacuating.',
        'Avoid submerged electrical poles, fallen cables, and open drainage channels.',
      ],
      after: [
        'Boil all drinking water for at least 3 minutes before consumption.',
        'Watch out for snakes and insects displaced by floodwaters entering homes.',
        'Do not turn on electrical appliances until verified dry by a certified electrician.',
      ],
    },
    cyclone: {
      title: 'Cyclones & Severe Gales',
      icon: Wind,
      color: 'text-primary-light',
      before: [
        'Trim dead tree branches near roofs and overhead power cables.',
        'Anchor or move loose outdoor furniture, corrugated tin sheets, and debris indoors.',
        'Charge power banks, mobile phones, and battery-operated emergency radios.',
      ],
      during: [
        'Remain inside the strongest interior room away from glass windows and doors.',
        'Beware of the "Eye of the Storm" — a sudden calm does not mean the cyclone is over.',
        'Unplug electrical equipment to prevent surge damage from lightning strikes.',
      ],
      after: [
        'Strictly follow official all-clear advisories broadcast by IMD or district administration.',
        'Report broken power lines and water pipeline ruptures via the 112 hotline.',
        'Do not visit cyclone damage sites as a spectator; leave roads clear for rescue teams.',
      ],
    },
    heat: {
      title: 'Extreme Heatwave & High Heat Index',
      icon: Thermometer,
      color: 'text-warning',
      before: [
        'Keep oral rehydration solution (ORS), lemonade, and coconut water stocked.',
        'Cover south- and west-facing windows with reflective curtains or sunshades.',
        'Schedule demanding outdoor labor during cooler early morning hours (before 10 AM).',
      ],
      during: [
        'Drink plenty of water even if not thirsty; avoid alcohol, tea, and sugary carbonated drinks.',
        'Wear loose, lightweight, light-colored cotton clothing and wide-brim hats outdoors.',
        'Never leave infants, elderly persons, or pets unattended in parked vehicles.',
      ],
      after: [
        'If someone exhibits heatstroke signs (hot dry skin, confusion, fainting), move them to shade immediately.',
        'Apply ice packs or cool wet cloths to the neck, armpits, and groin while summoning an ambulance (108).',
      ],
    },
    fire: {
      title: 'Fire Emergencies & Evacuation',
      icon: Flame,
      color: 'text-danger',
      before: [
        'Install working smoke detectors and know the locations of fire extinguishers.',
        'Practice a family fire escape plan with two distinct exits from every bedroom.',
      ],
      during: [
        'Crawl low under smoke towards the nearest exit — cleaner air remains near the floor.',
        'Feel doors with the back of your hand before opening; if hot, do not open.',
        'If clothing catches fire: STOP, DROP, and ROLL until flames are smothered.',
      ],
      after: [
        'Once outside, stay out. Never re-enter a burning structure under any circumstance.',
        'Seek medical attention immediately for smoke inhalation and burn injuries.',
      ],
    },
  };

  const current = disasterGuides[activeTab];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-4">
          Safety Protocols & <span className="gradient-text">Preparedness Guides</span>
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Standard operational guidance vetted by National Disaster Management Authority (NDMA) standards for citizens and emergency response coordinators.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        {Object.entries(disasterGuides).map(([key, item]) => {
          const Icon = item.icon;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === key
                  ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                  : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.title.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Guide Content Card */}
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
          <current.icon className={`w-8 h-8 ${current.color}`} />
          <h2 className="text-2xl font-bold text-text-primary">{current.title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Before */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent" /> Before (Preparedness)
            </h4>
            <ul className="space-y-3 text-xs text-text-secondary">
              {current.before.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* During */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-danger flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-danger" /> During (Immediate Action)
            </h4>
            <ul className="space-y-3 text-xs text-text-secondary">
              {current.during.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-success flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success" /> After (Recovery & Safety)
            </h4>
            <ul className="space-y-3 text-xs text-text-secondary">
              {current.after.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
