import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidentsApi } from '../../lib/api/endpoints';
import { useAuthStore } from '../../lib/store/authStore';
import { useUIStore } from '../../lib/store/uiStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { ReportingMap } from '../../features/maps/ReportingMap';
import {
  CloudRain, Wind, Thermometer, Flame, Building2, AlertTriangle,
  Upload, CheckCircle2, ArrowRight, ArrowLeft, MapPin, ShieldCheck,
  Camera, FileCheck, PhoneCall, Check
} from 'lucide-react';

export const ReportIncident = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);

  // Form State
  const [category, setCategory] = useState('flooding');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [latitude, setLatitude] = useState(17.3850);
  const [longitude, setLongitude] = useState(78.4867);
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [reporterName, setReporterName] = useState(user?.full_name || '');
  const [reporterContact, setReporterContact] = useState(user?.phone || '');
  const [isAnonymous, setIsAnonymous] = useState(!isAuthenticated);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const categories = [
    { id: 'flooding', label: 'Flooding & Inundation', icon: CloudRain, color: 'text-accent' },
    { id: 'cyclone', label: 'Cyclone / Severe Storm', icon: Wind, color: 'text-primary-light' },
    { id: 'fire', label: 'Fire Outbreak', icon: Flame, color: 'text-danger' },
    { id: 'heat', label: 'Extreme Heatwave', icon: Thermometer, color: 'text-warning' },
    { id: 'building_collapse', label: 'Building / Bridge Collapse', icon: Building2, color: 'text-danger' },
    { id: 'road_accident', label: 'Major Road Accident', icon: AlertTriangle, color: 'text-warning' },
    { id: 'landslide', label: 'Landslide / Rockfall', icon: AlertTriangle, color: 'text-warning' },
    { id: 'chemical', label: 'Chemical / Gas Leak', icon: AlertTriangle, color: 'text-danger' },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        addToast('File exceeds 50MB maximum size limit.', 'error');
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      addToast('Please provide an incident title and detailed description.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address.trim() || null,
        district: district.trim() || 'Hyderabad',
        state: state.trim() || 'Telangana',
        reporter_name: isAnonymous ? null : reporterName.trim() || null,
        reporter_contact: isAnonymous ? null : reporterContact.trim() || null,
        contact_public: false,
        idempotency_key: `report_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      };

      const res = await incidentsApi.create(payload);
      const created = res.data;

      // Upload evidence if attached
      if (selectedFile && created.id) {
        try {
          const formData = new FormData();
          formData.append('file', selectedFile);
          await incidentsApi.uploadEvidence(created.id, formData);
        } catch (uploadErr) {
          console.warn('Evidence upload failed:', uploadErr);
        }
      }

      setSubmittedReport(created);
      setCurrentStep(6);
      addToast('Disaster report logged successfully and queued for verification!', 'success');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to submit report. Please review fields.';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-4xl font-extrabold text-text-primary">
          Submit Emergency <span className="gradient-text">Disaster Report</span>
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Your report will be prioritized by operations room controllers and dispatched to field responders.
        </p>
      </div>

      {/* Wizard Progress Bar */}
      {currentStep < 6 && (
        <div className="mb-8 p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs font-semibold text-text-muted">
          <span className={currentStep === 1 ? 'text-accent font-bold' : ''}>1. Hazard</span>
          <span>→</span>
          <span className={currentStep === 2 ? 'text-accent font-bold' : ''}>2. Details</span>
          <span>→</span>
          <span className={currentStep === 3 ? 'text-accent font-bold' : ''}>3. Location</span>
          <span>→</span>
          <span className={currentStep === 4 ? 'text-accent font-bold' : ''}>4. Evidence</span>
          <span>→</span>
          <span className={currentStep === 5 ? 'text-accent font-bold' : ''}>5. Review</span>
        </div>
      )}

      {/* Step 1: Hazard Selection */}
      {currentStep === 1 && (
        <Card className="p-6 md:p-8 space-y-6 animate-slide-up">
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-1">Step 1: Select Hazard Type</h2>
            <p className="text-xs text-text-secondary">Choose the primary nature of the disaster or danger you are witnessing.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all select-none ${
                    isSelected
                      ? 'border-primary bg-primary/20 text-white shadow-lg shadow-primary/20 scale-105'
                      : 'border-border bg-surface-2/40 hover:border-border-2 hover:bg-surface-2 text-text-secondary'
                  }`}
                >
                  <Icon className={`w-8 h-8 ${cat.color}`} />
                  <span className="text-xs font-bold leading-tight">{cat.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-border/50">
            <Button variant="primary" onClick={() => setCurrentStep(2)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next: Hazard Details
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Description & Severity */}
      {currentStep === 2 && (
        <Card className="p-6 md:p-8 space-y-6 animate-slide-up">
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-1">Step 2: Describe the Emergency</h2>
            <p className="text-xs text-text-secondary">Provide specific details of current conditions and estimated severity.</p>
          </div>

          <Input
            label="Incident Title / Brief Headline"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Flash Flood Waterlogging Under Tolichowki Flyover"
          />

          <Textarea
            label="Detailed Description & Immediate Danger"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe water depth, trapped individuals, collapsed structures, road blockages..."
          />

          <div>
            <label className="form-label">Estimated Severity Level</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {['low', 'medium', 'high', 'critical'].map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setSeverity(lvl)}
                  className={`p-3 rounded-xl border text-xs font-bold uppercase transition-all ${
                    severity === lvl
                      ? 'border-primary bg-primary text-white shadow-md'
                      : 'border-border bg-surface text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <Button variant="ghost" onClick={() => setCurrentStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              variant="primary"
              disabled={!title.trim() || !description.trim()}
              onClick={() => setCurrentStep(3)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next: Pin Location
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Location Pinning */}
      {currentStep === 3 && (
        <Card className="p-6 md:p-8 space-y-6 animate-slide-up">
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-1">Step 3: Incident Location</h2>
            <p className="text-xs text-text-secondary">Click the map or use the GPS button to set the exact coordinates of the distress site.</p>
          </div>

          <ReportingMap
            latitude={latitude}
            longitude={longitude}
            onChangeCoordinates={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Street / Landmark / Colony"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Near Pillar No. 42"
            />
            <Input
              label="District / City"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
            <Input
              label="State"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <Button variant="ghost" onClick={() => setCurrentStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="primary" onClick={() => setCurrentStep(4)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next: Evidence Photos
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Evidence Attachment */}
      {currentStep === 4 && (
        <Card className="p-6 md:p-8 space-y-6 animate-slide-up">
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-1">Step 4: Evidence & Photos (Optional)</h2>
            <p className="text-xs text-text-secondary">Attach photos or short video clips to aid responders in determining necessary equipment (boats, pumps, fire tenders).</p>
          </div>

          <div className="p-8 border-2 border-dashed border-border rounded-2xl text-center bg-surface-2/30 hover:border-primary transition-colors cursor-pointer">
            <input
              type="file"
              id="evidence-file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="evidence-file" className="cursor-pointer flex flex-col items-center">
              <Camera className="w-10 h-10 text-primary-light mb-2" />
              <p className="text-sm font-semibold text-text-primary">Click to select photo or video</p>
              <p className="text-xs text-text-muted mt-1">JPEG, PNG, WebP, MP4 up to 50MB</p>
            </label>
          </div>

          {selectedFile && (
            <div className="p-4 rounded-xl bg-surface-2 border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                {filePreview ? (
                  <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-border" />
                ) : (
                  <FileCheck className="w-8 h-8 text-success" />
                )}
                <div>
                  <p className="text-xs font-bold text-text-primary truncate max-w-xs">{selectedFile.name}</p>
                  <p className="text-[10px] text-text-muted">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setSelectedFile(null); setFilePreview(null); }}>
                Remove
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <Button variant="ghost" onClick={() => setCurrentStep(3)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="primary" onClick={() => setCurrentStep(5)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next: Review & Submit
            </Button>
          </div>
        </Card>
      )}

      {/* Step 5: Review & Contact */}
      {currentStep === 5 && (
        <Card className="p-6 md:p-8 space-y-6 animate-slide-up">
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-1">Step 5: Review & Reporter Contact</h2>
            <p className="text-xs text-text-secondary">Review your report details and specify whether you wish to attach contact info for rescue dispatchers.</p>
          </div>

          {/* Privacy Toggle */}
          <div className="p-4 rounded-xl bg-surface-2/60 border border-border">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <div>
                <span className="text-xs font-bold text-text-primary">Report Anonymously</span>
                <p className="text-[11px] text-text-muted">No name or phone number will be associated with this report.</p>
              </div>
            </label>
          </div>

          {!isAnonymous && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Your Name"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Priya Sharma"
              />
              <Input
                label="Phone Number"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          )}

          {/* Report Summary Box */}
          <div className="p-4 rounded-xl bg-surface border border-border/70 text-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-text-muted">Hazard Category:</span>
              <span className="font-bold uppercase text-accent">{category}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-text-muted">Severity:</span>
              <Badge severity={severity}>{severity}</Badge>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-text-muted">Coordinates:</span>
              <span className="font-mono text-text-primary">{latitude}, {longitude}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Title:</span>
              <span className="font-bold text-text-primary">{title}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <Button variant="ghost" onClick={() => setCurrentStep(4)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              isLoading={submitting}
              className="font-bold"
            >
              Confirm & Submit Report
            </Button>
          </div>
        </Card>
      )}

      {/* Step 6: Confirmation Screen */}
      {currentStep === 6 && submittedReport && (
        <Card className="p-10 text-center max-w-xl mx-auto border-success/40 bg-success/5 animate-slide-up shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-success/20 text-success mx-auto flex items-center justify-center mb-6">
            <Check className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-text-primary mb-2">Report Successfully Registered!</h2>
          <p className="text-xs text-text-secondary max-w-md mx-auto mb-6">
            Your distress submission has been assigned a unique operational reference number. Triage controllers are reviewing the report.
          </p>

          <div className="p-4 rounded-xl bg-surface border border-border/80 inline-block mb-8">
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Tracking Reference Number</p>
            <p className="font-mono text-xl font-extrabold text-accent mt-1 select-all">
              {submittedReport.reference_number}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              onClick={() => navigate(`/track/${submittedReport.reference_number}`)}
            >
              Track This Report Live
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSubmittedReport(null);
                setCurrentStep(1);
                setTitle('');
                setDescription('');
              }}
            >
              Submit Another Report
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
