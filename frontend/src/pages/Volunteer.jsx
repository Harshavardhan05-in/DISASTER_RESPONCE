import React, { useState } from 'react';
import { volunteersApi } from '../lib/api/endpoints';
import { useAuthStore } from '../lib/store/authStore';
import { useUIStore } from '../lib/store/uiStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Users, Heart, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Volunteer = () => {
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const availableSkills = [
    'First Aid & BLS Medical',
    'Search & Urban Rescue',
    'Boat Handling & Lifeguard',
    'Amateur Radio (HAM) / Comms',
    'Heavy Vehicle & Bus Driving',
    'Community Kitchen Cooking',
    'Mental Health Psychological First Aid',
    'Local Language Translation',
  ];

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [availabilityNotes, setAvailabilityNotes] = useState('');
  const [district, setDistrict] = useState('Hyderabad');

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please log in or create an account first to register as a verified volunteer.', 'warning');
      navigate('/login');
      return;
    }

    if (selectedSkills.length === 0) {
      addToast('Please select at least one skill to register.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await volunteersApi.register({
        skills: selectedSkills,
        emergency_contact: emergencyContact,
        availability_notes: availabilityNotes,
        service_areas: [district],
        is_available: true,
      });
      setSuccess(true);
      addToast('You are now registered as an active emergency volunteer!', 'success');
    } catch (err) {
      addToast(err.response?.data?.error?.message || 'Registration failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-3">
          Join the <span className="gradient-text">Volunteer Taskforce</span>
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Be on standby to provide life-saving assistance, medical triage, and food logistics when localized disasters strike your district.
        </p>
      </div>

      {success ? (
        <Card className="p-10 text-center max-w-xl mx-auto border-success/40 bg-success/5">
          <div className="w-16 h-16 rounded-full bg-success/20 text-success mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Registration Confirmed!</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-6">
            Thank you for stepping forward. Your profile has been added to the district disaster response volunteer pool. You will be alerted when response tasks in {district} match your skills.
          </p>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Go to Your Dashboard
          </Button>
        </Card>
      ) : (
        <Card className="p-8">
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="form-label text-sm font-bold mb-3">Select Your Specializations & Skills</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {availableSkills.map((skill) => {
                  const isChecked = selectedSkills.includes(skill);
                  return (
                    <div
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer select-none transition-all flex items-center justify-between ${
                        isChecked
                          ? 'border-primary bg-primary/15 text-white shadow-sm'
                          : 'border-border bg-surface-2/40 text-text-secondary hover:border-border-2'
                      }`}
                    >
                      <span>{skill}</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                        isChecked ? 'bg-primary text-white border-primary' : 'border-border'
                      }`}>
                        {isChecked && '✓'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Primary Response District"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Hyderabad, Ranga Reddy, Vijayawada"
              />
              <Input
                label="Next-of-Kin / Emergency Contact"
                required
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Name and Phone Number"
              />
            </div>

            <Textarea
              label="Availability Schedule & Relevant Certifications"
              rows={3}
              value={availabilityNotes}
              onChange={(e) => setAvailabilityNotes(e.target.value)}
              placeholder="e.g. Red Cross certified, available on weekends and immediate flood callouts..."
            />

            {!isAuthenticated && (
              <div className="p-3 rounded-lg bg-surface-2 border border-border flex items-center gap-2 text-xs text-text-secondary">
                <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
                <span>You will be prompted to sign in or register so your profile can be linked.</span>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <Button size="lg" type="submit" variant="primary" isLoading={submitting}>
                Complete Volunteer Registration
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
