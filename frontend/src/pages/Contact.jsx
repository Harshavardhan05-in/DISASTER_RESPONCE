import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { useUIStore } from '../lib/store/uiStore';
import { PhoneCall, Mail, MapPin, Send, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Contact = () => {
  const { addToast } = useUIStore();
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    addToast('Your inquiry has been received. Our team will follow up shortly.', 'success');
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-3">
          Contact & <span className="gradient-text">Support Center</span>
        </h1>
        <p className="text-sm text-text-secondary">
          Reach our platform engineering desk, submit operational inquiries, or reach district disaster control liaison officers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-base text-text-primary mb-4">Official Channels</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-danger/10 text-danger rounded-lg flex-shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">Emergency Toll-Free</p>
                  <p className="text-text-secondary">Dial 112 (Police, Fire, Ambulance)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 text-primary-light rounded-lg flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">Support Desk</p>
                  <p className="text-text-secondary">support@dr360.local (Dev Desk)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-accent/10 text-accent rounded-lg flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">Operational Node</p>
                  <p className="text-text-secondary">Telangana State Disaster Management Control Room, Hyderabad</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-surface-2/40">
            <h4 className="font-bold text-sm text-text-primary mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-accent" /> Need Immediate Answers?
            </h4>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              Check out our frequently asked questions covering reporting privacy, how verification works, and how to find shelters.
            </p>
            <Link to="/faq" className="text-xs font-bold text-accent hover:underline">
              Browse Frequently Asked Questions →
            </Link>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <Card className="p-8">
            <h3 className="text-xl font-bold text-text-primary mb-2">Send an Inquiry</h3>
            <p className="text-xs text-text-secondary mb-6">
              For non-emergency communications, feedback, agency integration requests, or bug reports.
            </p>

            {sent ? (
              <div className="p-6 rounded-xl bg-success/10 border border-success/30 text-center">
                <h4 className="font-bold text-success text-base mb-1">Message Dispatched</h4>
                <p className="text-xs text-text-secondary">Thank you. An engineering liaison will get in touch with you.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Your Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <Input
                  label="Subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
                <Textarea
                  label="Message Content"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
                <Button type="submit" variant="primary" leftIcon={<Send className="w-4 h-4" />}>
                  Dispatch Inquiry
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
