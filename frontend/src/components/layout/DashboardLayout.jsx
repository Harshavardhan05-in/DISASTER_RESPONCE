import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert, LayoutDashboard, AlertTriangle, Users, MapPin,
  Package, BarChart3, LogOut, ArrowLeft, Home
} from 'lucide-react';
import { useAuthStore } from '../../lib/store/authStore';
import { ToastContainer } from '../ui/ToastContainer';

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const role = user?.role || 'citizen';

  const navItems = [
    { name: 'Dashboard Overview', path: role === 'platform_admin' ? '/admin' : role === 'field_responder' ? '/responder' : '/dashboard', icon: LayoutDashboard },
    { name: 'Disaster Incidents', path: '/admin/incidents', icon: AlertTriangle, adminOnly: true },
    { name: 'User Management', path: '/admin/users', icon: Users, adminOnly: true },
    { name: 'Relief Inventory', path: '/admin/resources', icon: Package, adminOnly: true },
    { name: 'Analytics & Reports', path: '/admin/analytics', icon: BarChart3, adminOnly: true },
  ];

  return (
    <div className="min-h-screen flex bg-bg text-text-primary">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Brand */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center p-0.5">
              <div className="w-full h-full bg-surface rounded-md flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-accent" />
              </div>
            </div>
            <span className="font-bold text-sm tracking-tight">
              DR<span className="text-accent">360</span> Console
            </span>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-border bg-surface-2/40">
          <p className="text-xs text-text-muted">Logged in as</p>
          <p className="text-sm font-semibold text-text-primary truncate">{user?.full_name || 'Responder'}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary-light">
            {role.replace('_', ' ')}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) => !item.adminOnly || role === 'platform_admin' || role === 'dept_operator' || role === 'dept_admin')
            .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/25 font-semibold'
                      : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-secondary hover:bg-surface-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Public Website
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
