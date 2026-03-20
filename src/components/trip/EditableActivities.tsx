import React, { useState } from 'react';
import type { Activity } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface EditableActivitiesProps {
  activities: Activity[];
  onAdd: (activity: Omit<Activity, 'id'>) => Promise<void>;
  onEdit: (id: string, activity: Omit<Activity, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  baseCurrency: string;
  showAddForm?: boolean;
  onAddFormChange?: (show: boolean) => void;
}

export const EditableActivities: React.FC<EditableActivitiesProps> = ({
  activities,
  onAdd,
  onEdit,
  onDelete,
  baseCurrency,
  showAddForm: externalShowAddForm,
  onAddFormChange,
}) => {
  const [internalShowAddForm, setInternalShowAddForm] = useState(false);
  const showAddForm = externalShowAddForm !== undefined ? externalShowAddForm : internalShowAddForm;
  const setShowAddForm = (value: boolean) => {
    if (onAddFormChange) {
      onAddFormChange(value);
    } else {
      setInternalShowAddForm(value);
    }
  };
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    estimatedCost: '',
    notes: '',
  });

  const handleAdd = async () => {
    if (!formData.name.trim()) return;
    await onAdd({
      name: formData.name.trim(),
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
      notes: formData.notes.trim() || undefined,
    });
    setFormData({ name: '', estimatedCost: '', notes: '' });
    setShowAddForm(false);
  };

  const handleStartEdit = (activity: Activity) => {
    setEditingId(activity.id);
    setFormData({
      name: activity.name,
      estimatedCost: activity.estimatedCost?.toString() || '',
      notes: activity.notes || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!formData.name.trim() || !editingId) return;
    await onEdit(editingId, {
      name: formData.name.trim(),
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
      notes: formData.notes.trim() || undefined,
    });
    setEditingId(null);
    setFormData({ name: '', estimatedCost: '', notes: '' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ name: '', estimatedCost: '', notes: '' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    await onDelete(id);
  };

  return (
    <div className="space-y-4">
      {(showAddForm || editingId) && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
          <Input
            label="Activity Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Estimated Cost"
            type="number"
            step="0.01"
            value={formData.estimatedCost}
            onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
            placeholder={`Amount in ${baseCurrency}`}
          />
          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={editingId ? handleSaveEdit : handleAdd}>
              {editingId ? 'Save' : 'Add'}
            </Button>
            <Button size="sm" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {activities.map(activity => (
          <div key={activity.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {editingId === activity.id ? null : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{activity.name}</p>
                  {activity.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.notes}</p>
                  )}
                  {activity.estimatedCost && (
                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mt-1">
                      {baseCurrency} {activity.estimatedCost}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="ghost" onClick={() => handleStartEdit(activity)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(activity.id)} className="text-red-600 dark:text-red-400">
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {activities.length === 0 && !showAddForm && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No activities added yet.</p>
      )}
    </div>
  );
};


