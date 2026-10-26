import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../lib/store/authStore';
import { useUIStore } from '../../lib/store/uiStore';
import { incidentsApi } from '../../lib/api/endpoints';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  AlertTriangle, Search, Filter, RefreshCw, Eye,
  Clock, MapPin, ExternalLink, ShieldCheck, FileText
} from 'lucide-react';

export const AdminIncidents = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Modal State
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('acknowledged');
  const [reason, setReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await incidentsApi.list();
      setIncidents(res.data || []);
    } catch (err) {
      console.error('Error fetching incidents:', err);
      addToast('Failed to fetch incident registry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleOpenModal = (incident) => {
    setSelectedIncident(incident);
    setNewStatus(incident.status);
    setReason('');
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;
    setIsUpdating(true);
    try {
      await incidentsApi.updateStatus(selectedIncident.id, {
        status: newStatus,
        reason: reason.trim() || `Administrative state transition by ${user?.full_name || 'Admin'}`,
      });
      addToast(`Incident updated to ${newStatus}`, 'success');
      setIsModalOpen(false);
      fetchIncidents();
    } catch (err) {
      console.error('Failed to update status:', err);
      addToast(err.response?.data?.detail || 'Failed to update status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      inc.reference_number?.toLowerCase().includes(q) ||
      inc.title?.toLowerCase().includes(q) ||
      inc.district?.toLowerCase().includes(q) ||
      inc.state?.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'all' || inc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || inc.severity === severityFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesSeverity;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-surface border border-border shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-accent">Incident Command Registry</span>
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary mt-1">
            Disaster Reports & Triage
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Validate citizen and field hazard reports, assign responders, and supervise verification workflows.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchIncidents}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Feed
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search by ref, title, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-text-muted" />}
          />

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Hazards' },
              { value: 'flooding', label: 'Flooding' },
              { value: 'cyclone', label: 'Cyclone' },
              { value: 'earthquake', label: 'Earthquake' },
              { value: 'fire', label: 'Fire' },
              { value: 'landslide', label: 'Landslide' },
              { value: 'heat', label: 'Heatwave' },
              { value: 'building_collapse', label: 'Building Collapse' },
              { value: 'other', label: 'Other Hazards' },
            ]}
          />

          <Select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Severities' },
              { value: 'critical', label: 'Critical' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'submitted', label: 'Submitted (New)' },
              { value: 'acknowledged', label: 'Acknowledged' },
              { value: 'assigned', label: 'Assigned' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />
        </div>
      </Card>

      {/* Data Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredIncidents.length === 0 ? (
        <EmptyState
          title="No incident records found"
          description="Try modifying search keywords or clearing filter criteria."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setCategoryFilter('all');
            setStatusFilter('all');
            setSeverityFilter('all');
          }}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2/60 text-xs text-text-muted uppercase border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Title & Category</th>
                  <th className="px-4 py-3 font-semibold">Severity</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Reported</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-surface-2/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-accent text-xs">
                      {inc.reference_number}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-text-primary text-sm line-clamp-1">{inc.title}</p>
                      <span className="text-[11px] text-text-muted uppercase font-medium">{inc.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge severity={inc.severity}>{inc.severity}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={inc.status}>{inc.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      {inc.district ? `${inc.district}, ${inc.state || 'India'}` : 'Location recorded'}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">
                      {new Date(inc.reported_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenModal(inc)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Manage
                        </Button>
                        <Link to={`/track/${inc.reference_number}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Incident Review & Status Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Incident Review: ${selectedIncident?.reference_number || ''}`}
        maxWidth="max-w-2xl"
      >
        {selectedIncident && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-2/60 border border-border/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-accent">
                  Ref: {selectedIncident.reference_number}
                </span>
                <div className="flex items-center gap-2">
                  <Badge severity={selectedIncident.severity}>{selectedIncident.severity}</Badge>
                  <Badge status={selectedIncident.status}>{selectedIncident.status}</Badge>
                </div>
              </div>
              <h3 className="text-base font-bold text-text-primary">{selectedIncident.title}</h3>
              <p className="text-xs text-text-secondary">{selectedIncident.description}</p>
              <div className="flex items-center gap-4 text-xs text-text-muted pt-2 border-t border-border/40">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  {selectedIncident.district || 'Unspecified'} ({selectedIncident.latitude}, {selectedIncident.longitude})
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(selectedIncident.reported_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Evidence items */}
            {selectedIncident.evidence && selectedIncident.evidence.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-text-primary mb-2">Attached Photographic Evidence:</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedIncident.evidence.map((ev) => (
                    <a
                      key={ev.id}
                      href={ev.file_path}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-surface-2 border border-border/50 text-xs text-accent hover:underline flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="truncate">{ev.original_filename || 'Evidence File'}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Status Change Form */}
            <form onSubmit={handleStatusUpdate} className="space-y-3 pt-3 border-t border-border/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Administrative Action & Triage Transition
              </h4>

              <Select
                label="New Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                options={[
                  { value: 'submitted', label: 'Submitted (Citizen Submission)' },
                  { value: 'acknowledged', label: 'Acknowledged (Under Dispatch Review)' },
                  { value: 'assigned', label: 'Assigned (Tactical Team Dispatched)' },
                  { value: 'in_progress', label: 'In Progress (Active Incident)' },
                  { value: 'resolved', label: 'Resolved (Danger Neutralized)' },
                  { value: 'closed', label: 'Closed (Verification Completed)' },
                  { value: 'rejected', label: 'Rejected (Duplicate / Invalid)' },
                ]}
                required
              />

              <Textarea
                label="Status Transition Justification / Audit Reason"
                placeholder="Detail reason for status update, operational orders, or closure verification..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
              />

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isUpdating}
                >
                  Confirm Status Change
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};
