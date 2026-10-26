import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/store/authStore';
import { useUIStore } from '../../lib/store/uiStore';
import { incidentsApi } from '../../lib/api/endpoints';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  ShieldAlert, MapPin, Clock, CheckCircle2, AlertTriangle,
  Radio, Navigation, ArrowUpRight, Phone, RefreshCw, FileText
} from 'lucide-react';

export const ResponderDashboard = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('in_progress');
  const [statusReason, setStatusReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await incidentsApi.list();
      setIncidents(res.data || []);
    } catch (err) {
      console.error('Failed to fetch responder incidents:', err);
      addToast('Failed to sync incident list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleOpenStatusModal = (incident) => {
    setSelectedIncident(incident);
    setNewStatus(incident.status === 'assigned' ? 'in_progress' : 'resolved');
    setStatusReason('');
    setModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;
    setIsUpdating(true);
    try {
      await incidentsApi.updateStatus(selectedIncident.id, {
        status: newStatus,
        reason: statusReason.trim() || `Field update by ${user?.full_name || 'responder'}`,
      });
      addToast(`Status updated to ${newStatus.replace('_', ' ')}`, 'success');
      setModalOpen(false);
      fetchIncidents();
    } catch (err) {
      console.error('Update status failed:', err);
      addToast(err.response?.data?.detail || 'Failed to update incident status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (filterStatus === 'all') return true;
    return inc.status === filterStatus;
  });

  const activeCount = incidents.filter((i) => ['acknowledged', 'assigned', 'in_progress'].includes(i.status)).length;
  const criticalCount = incidents.filter((i) => i.severity === 'critical').length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-surface border border-border shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-accent">Field Operations Console</span>
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary mt-1">
            Tactical Incident Queue
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Logged in as <span className="text-text-primary font-medium">{user?.full_name || 'Responder'}</span> • Ready for rapid dispatch & status validation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchIncidents}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-warning">
          <p className="text-xs font-semibold text-text-muted uppercase">Active Deployments</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-black text-text-primary">{activeCount}</span>
            <Radio className="w-5 h-5 text-warning" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-danger">
          <p className="text-xs font-semibold text-text-muted uppercase">Critical Urgency</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-black text-danger">{criticalCount}</span>
            <AlertTriangle className="w-5 h-5 text-danger" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-success">
          <p className="text-xs font-semibold text-text-muted uppercase">Resolved Today</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-black text-success">{resolvedCount}</span>
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { label: 'All Incidents', value: 'all' },
          { label: 'Pending / Assigned', value: 'assigned' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Resolved', value: 'resolved' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === tab.value
                ? 'bg-primary text-white font-semibold shadow-md shadow-primary/20'
                : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-2 border border-border/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Incident List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredIncidents.length === 0 ? (
        <EmptyState
          title="No incidents matching filter"
          description="There are currently no incidents in the queue for this status filter."
          actionLabel="Show All Incidents"
          onAction={() => setFilterStatus('all')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIncidents.map((incident) => {
            const hasCoords = incident.latitude && incident.longitude;
            const mapsUrl = hasCoords
              ? `https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`
              : null;

            return (
              <Card key={incident.id} className="p-5 flex flex-col justify-between" hover>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-accent">
                          {incident.reference_number}
                        </span>
                        <Badge severity={incident.severity}>{incident.severity}</Badge>
                      </div>
                      <h3 className="font-bold text-base text-text-primary mt-1">
                        {incident.title}
                      </h3>
                    </div>
                    <Badge status={incident.status}>{incident.status}</Badge>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2">
                    {incident.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-border/40 text-xs text-text-muted">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span className="truncate">{incident.district || incident.address || 'Location registered'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Reported {new Date(incident.reported_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:border-accent text-text-secondary hover:text-accent transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Directions
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenStatusModal(incident)}
                    >
                      Update Status
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Status Update Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Update Incident Status: ${selectedIncident?.reference_number || ''}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <Select
            label="New Operational Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: 'acknowledged', label: 'Acknowledged (Under Dispatch Review)' },
              { value: 'assigned', label: 'Assigned to Unit' },
              { value: 'in_progress', label: 'In Progress (On Scene)' },
              { value: 'resolved', label: 'Resolved (Danger Neutralized)' },
              { value: 'closed', label: 'Closed (Administrative Verification Complete)' },
            ]}
            required
          />

          <Textarea
            label="Action Taken / Operational Note"
            placeholder="Document actions taken on scene, personnel dispatched, or resolution details..."
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
            rows={3}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdating}
            >
              Commit Update
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
