import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/store/authStore';
import { incidentsApi } from '../../lib/api/endpoints';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Clock, MapPin, AlertCircle, FileText, User } from 'lucide-react';

export const CitizenDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyReports = async () => {
      setLoading(true);
      try {
        const res = await incidentsApi.list();
        setReports(res.data);
      } catch (e) {
        console.warn('Failed to load user reports:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMyReports();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Welcome Banner */}
      <div className="p-8 rounded-2xl bg-surface border border-border shadow-xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent">Citizen Portal</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary mt-1">
            Welcome, {user?.full_name || 'Citizen'}
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Monitor the progress of your submitted reports, verify response updates, and stay informed.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/report')} leftIcon={<PlusCircle className="w-4 h-4" />}>
          Report New Incident
        </Button>
      </div>

      {/* Reports Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Your Incident Reports & Local Feed</h2>
          <span className="text-xs text-text-muted">{reports.length} total recorded</span>
        </div>

        {loading ? (
          <Spinner size="lg" className="my-16" />
        ) : reports.length === 0 ? (
          <EmptyState
            title="No reports submitted yet"
            description="You have not submitted any hazard reports from this account."
            actionLabel="Report an Emergency"
            onAction={() => navigate('/report')}
          />
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Card key={report.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" hover>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-accent">{report.reference_number}</span>
                    <Badge severity={report.severity}>{report.severity}</Badge>
                    <Badge status={report.status}>{report.status}</Badge>
                  </div>

                  <h3 className="font-bold text-sm text-text-primary">{report.title}</h3>

                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      {report.district || 'Location recorded'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(report.reported_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Link to={`/track/${report.reference_number}`}>
                  <Button variant="outline" size="sm">
                    View Live Timeline →
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
