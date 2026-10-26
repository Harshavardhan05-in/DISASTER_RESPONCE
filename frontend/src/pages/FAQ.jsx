import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';

export const FAQ = () => {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does Disaster Response 360 verify reported incidents?',
      a: 'When an incident is reported, it enters the "Submitted" state. Operations room controllers cross-reference it against nearby sensor data, official meteorological feeds, and duplicate reports within a 2-kilometer radius before transitioning to "Acknowledged" and assigning field responders.',
    },
    {
      q: 'Can I report a disaster anonymously without creating an account?',
      a: 'Yes. Citizens can submit disaster reports with GPS coordinates and photos without an account. However, providing optional contact details allows response teams to request critical updates if life-saving rescues are underway.',
    },
    {
      q: 'Is my personal contact information visible to the public?',
      a: 'No. Reporter personal identity and phone numbers are strictly protected and never displayed on public situational maps. Only authorized first responder coordinators with verified administrative credentials can access contact info.',
    },
    {
      q: 'Where do the official early warning alerts come from?',
      a: 'Alerts are ingested using Common Alerting Protocol (CAP) standards from the India Meteorological Department (IMD), National Disaster Management Authority (NDMA), and State Disaster Management Authorities (SDMA).',
    },
    {
      q: 'How are evacuation shelters designated and monitored?',
      a: 'Relief camps and evacuation shelters are officially designated government properties (stadiums, community halls, civic centers) vetted for structural safety, sanitation, and clean water access. Camp officers update current occupancy counts regularly.',
    },
    {
      q: 'How do NGOs and volunteers participate?',
      a: 'Humanitarian organizations can register via the NGO coordination portal. Registered volunteers can declare specialized qualifications (first aid, boat handling, HAM radio) and will be dispatched when localized incidents require reinforcement.',
    },
    {
      q: 'What should I do in an immediate life-threatening emergency?',
      a: 'Always call India’s national emergency response number 112 directly. Do not wait for an in-app report response if floodwaters, fire, or building collapse pose an immediate danger.',
    },
  ];

  const filtered = faqs.filter(
    (f) => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-3">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Learn how Disaster Response 360 coordinates emergency operations, safeguards citizen privacy, and handles critical data triage.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-8 max-w-xl mx-auto">
        <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search question or topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input pl-10 text-xs py-2.5 bg-surface"
        />
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-4">
        {filtered.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <Card key={idx} className="overflow-hidden transition-all">
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-text-primary hover:text-accent transition-colors"
              >
                <span>{item.q}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-accent flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-text-muted flex-shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-text-secondary leading-relaxed border-t border-border/40 pt-3 animate-fade-in">
                  {item.a}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
