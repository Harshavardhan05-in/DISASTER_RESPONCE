import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useThemeStore } from './lib/store/themeStore';
import { useAuthStore } from './lib/store/authStore';
import { ToastContainer } from './components/ui/ToastContainer';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { Landing } from './pages/Landing';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { SituationOverview } from './pages/SituationOverview';
import { Alerts } from './pages/Alerts';
import { Safety } from './pages/Safety';
import { EmergencyServices } from './pages/EmergencyServices';
import { Shelters } from './pages/Shelters';
import { NGOs } from './pages/NGOs';
import { Volunteer } from './pages/Volunteer';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { Accessibility } from './pages/Accessibility';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { NotFound } from './pages/NotFound';
import { ServiceUnavailable } from './pages/ServiceUnavailable';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Operational & Dashboard Pages
import { TrackIncident } from './pages/incidents/TrackIncident';
import { ReportIncident } from './pages/reporting/ReportIncident';
import { CitizenDashboard } from './pages/dashboard/CitizenDashboard';
import { ResponderDashboard } from './pages/responder/ResponderDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminIncidents } from './pages/admin/AdminIncidents';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminResources } from './pages/admin/AdminResources';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

// Scroll to top on route navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Route protection component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If responder tries to access admin, send to /responder
    if (user.role === 'field_responder') {
      return <Navigate to="/responder" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <ToastContainer />
        <Routes>
          {/* Public Pages with Standard Header & Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/situation" element={<SituationOverview />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/emergency-services" element={<EmergencyServices />} />
            <Route path="/shelters" element={<Shelters />} />
            <Route path="/ngos" element={<NGOs />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/track" element={<TrackIncident />} />
            <Route path="/track/:reportId" element={<TrackIncident />} />
            <Route path="/report" element={<ReportIncident />} />
            <Route path="/503" element={<ServiceUnavailable />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Authenticated Management & Operational Consoles */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<CitizenDashboard />} />
            <Route
              path="/responder"
              element={
                <ProtectedRoute allowedRoles={['field_responder', 'dept_operator', 'dept_admin', 'platform_admin']}>
                  <ResponderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['dept_operator', 'dept_admin', 'platform_admin', 'auditor']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/incidents"
              element={
                <ProtectedRoute allowedRoles={['dept_operator', 'dept_admin', 'platform_admin']}>
                  <AdminIncidents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['dept_admin', 'platform_admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/resources"
              element={
                <ProtectedRoute allowedRoles={['dept_operator', 'dept_admin', 'platform_admin']}>
                  <AdminResources />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['dept_admin', 'platform_admin', 'auditor']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
