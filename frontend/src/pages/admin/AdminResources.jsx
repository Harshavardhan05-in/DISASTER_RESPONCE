import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/store/authStore';
import { useUIStore } from '../../lib/store/uiStore';
import { resourcesApi } from '../../lib/api/endpoints';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Package, PlusCircle, RefreshCw, MapPin, Box,
  Layers, CheckCircle2, Shield
} from 'lucide-react';

export const AdminResources = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New inventory form
  const [formData, setFormData] = useState({
    category_id: '',
    location_name: '',
    location_type: 'depot',
    quantity_total: 100,
    district: '',
    state: 'Telangana',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, invRes] = await Promise.all([
        resourcesApi.listCategories(),
        resourcesApi.listInventory(),
      ]);
      setCategories(catRes.data || []);
      setInventory(invRes.data || []);
      if (catRes.data?.length > 0 && !formData.category_id) {
        setFormData((prev) => ({ ...prev, category_id: catRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load relief resources:', err);
      addToast('Failed to load relief inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInventory = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await resourcesApi.createInventory({
        ...formData,
        quantity_total: Number(formData.quantity_total),
      });
      addToast('Inventory batch registered successfully', 'success');
      setIsModalOpen(false);
      setFormData({
        category_id: categories[0]?.id || '',
        location_name: '',
        location_type: 'depot',
        quantity_total: 100,
        district: '',
        state: 'Telangana',
      });
      fetchData();
    } catch (err) {
      console.error('Create inventory error:', err);
      addToast(err.response?.data?.detail || 'Failed to register inventory batch', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-surface border border-border shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-accent">Relief Logistics & Supply Chain</span>
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary mt-1">
            Relief Inventory Management
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Track disaster relief stockpiles, emergency ration distribution, and equipment readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Stock
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          >
            Add Supply Batch
          </Button>
        </div>
      </div>

      {/* Stock Category Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map((cat) => (
          <Card key={cat.id} className="p-4" hover>
            <div className="flex items-center gap-2 text-accent">
              <Box className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{cat.name}</span>
            </div>
            <p className="text-xs text-text-secondary mt-1 line-clamp-1">{cat.description || 'Emergency stockpile'}</p>
            <span className="inline-block mt-2 text-[10px] text-text-muted">Unit: {cat.unit}</span>
          </Card>
        ))}
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : inventory.length === 0 ? (
        <EmptyState
          title="No inventory records available"
          description="Register supplies to establish tracking across emergency depots and distribution hubs."
          actionLabel="Add Stock Batch"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2/60 text-xs text-text-muted uppercase border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Location / Depot</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">District</th>
                  <th className="px-4 py-3 font-semibold">Available</th>
                  <th className="px-4 py-3 font-semibold">Reserved</th>
                  <th className="px-4 py-3 font-semibold">Total Stock</th>
                  <th className="px-4 py-3 font-semibold">Last Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {inventory.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-2/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-text-primary text-sm">
                      {inv.location_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-2 text-text-secondary border border-border">
                        {inv.location_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {inv.district || 'Regional Hub'}
                    </td>
                    <td className="px-4 py-3 font-bold text-accent">
                      {inv.quantity_available}
                    </td>
                    <td className="px-4 py-3 text-warning font-medium">
                      {inv.quantity_reserved}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-text-primary">
                      {inv.quantity_total}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {new Date(inv.last_updated_at || inv.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Inventory Batch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Relief Supply Batch"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateInventory} className="space-y-4">
          <Select
            label="Supply Category"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            options={categories.map((c) => ({ value: c.id, label: `${c.name} (${c.unit})` }))}
            required
          />

          <Input
            label="Storage Hub / Location Name"
            placeholder="e.g. Hyderabad Central Disaster Depot"
            value={formData.location_name}
            onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Location Type"
              value={formData.location_type}
              onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
              options={[
                { value: 'depot', label: 'Central Depot' },
                { value: 'shelter', label: 'Relief Shelter' },
                { value: 'vehicle', label: 'Mobile Dispatch Unit' },
              ]}
              required
            />

            <Input
              label="Total Quantity"
              type="number"
              min="1"
              value={formData.quantity_total}
              onChange={(e) => setFormData({ ...formData, quantity_total: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="District"
              placeholder="e.g. Hyderabad"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              required
            />

            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Add to Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
