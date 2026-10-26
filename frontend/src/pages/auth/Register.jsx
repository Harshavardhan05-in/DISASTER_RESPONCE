import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store/authStore';
import { useUIStore } from '../../lib/store/uiStore';
import { authApi } from '../../lib/api/endpoints';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ShieldAlert, Check } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    preferred_language: 'en',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authApi.register(formData);
      const tokens = res.data;

      localStorage.setItem('dr360_access_token', tokens.access_token);
      localStorage.setItem('dr360_refresh_token', tokens.refresh_token);

      const profileRes = await authApi.getMe();
      const user = profileRes.data;

      setAuth(tokens, user);
      addToast('Account created successfully! Welcome to Disaster Response 360.', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Registration failed. Check your password strength and email.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />

        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-text-primary">Create Your Account</h1>
          <p className="text-xs text-text-secondary mt-1">
            Join the platform to track submitted incident reports, access local early alerts, and volunteer
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Priya Sharma"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />

          <Input
            label="Email Address"
            type="email"
            required
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Mobile Phone Number (Optional)"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            helperText="Used only by rescue coordinators to confirm critical incident locations."
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="At least 8 chars, 1 uppercase, 1 digit"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <div>
            <label className="form-label">Preferred Interface Language</label>
            <select
              value={formData.preferred_language}
              onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
              className="form-input text-xs py-2 bg-surface cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full mt-4" isLoading={loading}>
            Complete Registration
          </Button>
        </form>

        <p className="text-center text-xs text-text-muted mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-accent hover:underline font-semibold">
            Sign In here
          </Link>
        </p>
      </Card>
    </div>
  );
};
