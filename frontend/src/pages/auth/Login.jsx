import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/store/authStore';
import { useUIStore } from '../../lib/store/uiStore';
import { authApi } from '../../lib/api/endpoints';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ShieldAlert, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { addToast } = useUIStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authApi.login({ email, password });
      const tokens = res.data;

      // Set tokens first, then fetch profile
      localStorage.setItem('dr360_access_token', tokens.access_token);
      localStorage.setItem('dr360_refresh_token', tokens.refresh_token);

      const profileRes = await authApi.getMe();
      const user = profileRes.data;

      setAuth(tokens, user);
      addToast(`Welcome back, ${user.full_name}!`, 'success');

      // Navigate based on role
      if (user.role === 'platform_admin' || user.role === 'dept_admin') {
        navigate('/admin');
      } else if (user.role === 'field_responder') {
        navigate('/responder');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Invalid email or password.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
        {/* Top ambient highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent p-0.5 mx-auto mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-surface rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-accent" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary">Sign in to DR360</h1>
          <p className="text-xs text-text-secondary mt-1">
            Access citizen reporting history or authorized operations console
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={loading}>
            Sign In
          </Button>
        </form>

        {/* Demo Fast-Fill Buttons */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted text-center mb-3">
            Quick-Fill Demonstration Accounts
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@dr360.local', 'AdminPass123!')}
              className="p-2 rounded-lg bg-surface-2 hover:bg-surface-2/80 text-text-secondary hover:text-text-primary border border-border/60 text-left text-[11px]"
            >
              <strong className="block text-accent">Platform Admin</strong>
              <span>admin@dr360.local</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('operator@dr360.local', 'OperatorPass123!')}
              className="p-2 rounded-lg bg-surface-2 hover:bg-surface-2/80 text-text-secondary hover:text-text-primary border border-border/60 text-left text-[11px]"
            >
              <strong className="block text-primary-light">Dept Operator</strong>
              <span>operator@dr360.local</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('responder@dr360.local', 'ResponderPass123!')}
              className="p-2 rounded-lg bg-surface-2 hover:bg-surface-2/80 text-text-secondary hover:text-text-primary border border-border/60 text-left text-[11px]"
            >
              <strong className="block text-warning">Field Responder</strong>
              <span>responder@dr360.local</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('citizen@dr360.local', 'CitizenPass123!')}
              className="p-2 rounded-lg bg-surface-2 hover:bg-surface-2/80 text-text-secondary hover:text-text-primary border border-border/60 text-left text-[11px]"
            >
              <strong className="block text-success">Citizen Reporter</strong>
              <span>citizen@dr360.local</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          Do not have an account?{' '}
          <Link to="/register" className="text-accent hover:underline font-semibold">
            Register here
          </Link>
        </p>
      </Card>
    </div>
  );
};
