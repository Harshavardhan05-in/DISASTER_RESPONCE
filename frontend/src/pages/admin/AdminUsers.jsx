import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/store/authStore';
import { useUIStore } from '../../lib/store/uiStore';
import { adminApi } from '../../lib/api/endpoints';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Users, UserCheck, Shield, Search, RefreshCw,
  KeyRound, AlertCircle, CheckCircle2
} from 'lucide-react';

const SYSTEM_ROLES = [
  { value: 'citizen', label: 'Citizen (Public Reporting)' },
  { value: 'volunteer', label: 'Registered Volunteer' },
  { value: 'ngo_member', label: 'NGO Relief Coordinator' },
  { value: 'field_responder', label: 'Field Responder' },
  { value: 'dept_operator', label: 'Department Operator' },
  { value: 'dept_admin', label: 'Department Admin' },
  { value: 'platform_admin', label: 'Platform Admin' },
  { value: 'auditor', label: 'Compliance Auditor' },
];

export const AdminUsers = () => {
  const { user: currentUser } = useAuthStore();
  const { addToast } = useUIStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('citizen');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      addToast('Failed to fetch user directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsModalOpen(true);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsUpdating(true);
    try {
      await adminApi.updateRole(selectedUser.id, newRole);
      addToast(`Updated role for ${selectedUser.full_name} to ${newRole}`, 'success');
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error changing role:', err);
      addToast(err.response?.data?.detail || 'Failed to update user role', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-surface border border-border shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-xs font-bold uppercase tracking-wider text-accent">Access Control & Security</span>
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary mt-1">
            System User Management
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Manage user roles, grant responder & administrator clearances, and audit operational access.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Users
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Search by full name, email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-text-muted" />}
          />

          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[{ value: 'all', label: 'All Roles' }, ...SYSTEM_ROLES]}
          />
        </div>
      </Card>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try adjusting your keyword filter or role selection."
          actionLabel="Show All Users"
          onAction={() => {
            setSearchQuery('');
            setRoleFilter('all');
          }}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2/60 text-xs text-text-muted uppercase border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">User Details</th>
                  <th className="px-4 py-3 font-semibold">Role & Permissions</th>
                  <th className="px-4 py-3 font-semibold">Verification</th>
                  <th className="px-4 py-3 font-semibold">Registered</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-2/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-text-primary text-sm">{u.full_name}</p>
                      <p className="text-xs text-text-muted font-mono">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-primary/15 text-primary-light border border-primary/25">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {currentUser?.role === 'platform_admin' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenRoleModal(u)}
                          leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                        >
                          Modify Role
                        </Button>
                      ) : (
                        <span className="text-xs text-text-muted">Read Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Role Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Change Role: ${selectedUser?.full_name || ''}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveRole} className="space-y-4">
          <div className="p-3 rounded-lg bg-surface-2/70 border border-border/50 text-xs text-text-secondary">
            <p className="font-semibold text-text-primary mb-1">User Account:</p>
            <p>{selectedUser?.full_name} ({selectedUser?.email})</p>
          </div>

          <Select
            label="Assigned Access Role"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            options={SYSTEM_ROLES}
            required
          />

          <p className="text-[11px] text-text-muted">
            Changing user role immediately alters permissions for responding to incidents, viewing sensitive contact details, and administrative controls.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdating}
            >
              Update Clearance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
