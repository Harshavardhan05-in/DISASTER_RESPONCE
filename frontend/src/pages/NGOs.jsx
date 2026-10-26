import React, { useEffect, useState } from 'react';
import { ngosApi } from '../lib/api/endpoints';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { useUIStore } from '../lib/store/uiStore';
import { HeartHandshake, CheckCircle2, Globe, Mail, Phone, PlusCircle } from 'lucide-react';

export const NGOs = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState({
    name: '',
    registration_number: '',
    mission: '',
    description: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
  });

  const fetchNGOs = async () => {
    setLoading(true);
    try {
      const res = await ngosApi.list();
      setNgos(res.data);
    } catch (e) {
      console.warn('Failed to load NGOs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNGOs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ngosApi.register(formData);
      addToast('NGO registration submitted for administrative verification.', 'success');
      setModalOpen(false);
      setFormData({
        name: '',
        registration_number: '',
        mission: '',
        description: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        website: '',
      });
      fetchNGOs();
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Registration failed. Check inputs.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary mb-2">
            Humanitarian <span className="gradient-text">NGO & Relief Coordination</span>
          </h1>
          <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
            Accredited non-governmental partners cooperating with district authorities to warehouse relief supplies, staff community kitchens, and deploy medical first responders.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Register Relief Agency
        </Button>
      </div>

      {/* NGO List */}
      {loading ? (
        <Spinner size="lg" className="my-16" />
      ) : ngos.length === 0 ? (
        <Card className="p-8 text-center text-text-secondary">
          No NGO partners registered yet. Be the first to register your relief organization.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ngos.map((ngo) => (
            <Card key={ngo.id} className="p-6 flex flex-col justify-between" hover>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-accent" />
                    <span className="text-xs font-mono text-text-muted">
                      {ngo.registration_number || 'Registered Agency'}
                    </span>
                  </div>
                  {ngo.is_verified && (
                    <span className="text-[10px] font-bold text-success bg-success/15 border border-success/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified Partner
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-text-primary mb-2">{ngo.name}</h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  {ngo.description || ngo.mission}
                </p>

                {ngo.hazard_specialties && ngo.hazard_specialties.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {ngo.hazard_specialties.map((item, i) => (
                      <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-2 text-primary-light uppercase">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border/50 text-xs text-text-muted space-y-1.5">
                {ngo.contact_name && <p><strong className="text-text-primary">Liaison:</strong> {ngo.contact_name}</p>}
                <div className="flex items-center gap-4 pt-1">
                  {ngo.contact_phone && (
                    <a href={`tel:${ngo.contact_phone}`} className="flex items-center gap-1 text-accent hover:underline">
                      <Phone className="w-3 h-3" /> {ngo.contact_phone}
                    </a>
                  )}
                  {ngo.contact_email && (
                    <a href={`mailto:${ngo.contact_email}`} className="flex items-center gap-1 text-primary-light hover:underline">
                      <Mail className="w-3 h-3" /> {ngo.contact_email}
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Registration Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Relief Organization">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Organization Official Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Humanitarian Relief Trust"
          />
          <Input
            label="Government Registration / NGO Darpan ID"
            value={formData.registration_number}
            onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
            placeholder="e.g. DL-1994-00123"
          />
          <Textarea
            label="Mission Statement & Capabilities"
            required
            value={formData.mission}
            onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
            placeholder="Describe your equipment, relief warehouses, and deployment speed..."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contact Officer"
              value={formData.contact_name}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
            />
            <Input
              label="Official Phone"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            />
          </div>
          <Input
            label="Official Email"
            type="email"
            value={formData.contact_email}
            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
          />

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Submit for Verification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
