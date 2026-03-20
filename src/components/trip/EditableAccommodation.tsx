import React, { useState } from 'react';
import type { Accommodation } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { format } from 'date-fns';

interface EditableAccommodationProps {
  accommodation: Accommodation | undefined;
  onSave: (accommodation: Accommodation) => Promise<void>;
  onDelete: () => Promise<void>;
  baseCurrency: string;
  defaultCheckIn: string;
  defaultCheckOut: string;
}

export const EditableAccommodation: React.FC<EditableAccommodationProps> = ({
  accommodation,
  onSave,
  onDelete,
  baseCurrency,
  defaultCheckIn,
  defaultCheckOut,
}) => {
  const [isEditing, setIsEditing] = useState(!accommodation);
  const [formData, setFormData] = useState<Accommodation>(
    accommodation || {
      type: 'hotel',
      name: '',
      address: '',
      checkInDate: defaultCheckIn,
      checkOutDate: defaultCheckOut,
      pricePerNight: undefined,
      notes: undefined,
    }
  );

  const handleSave = async () => {
    await onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (accommodation) {
      setFormData(accommodation);
      setIsEditing(false);
    } else {
      setFormData({
        type: 'hotel',
        name: '',
        address: '',
        checkInDate: defaultCheckIn,
        checkOutDate: defaultCheckOut,
        pricePerNight: undefined,
        notes: undefined,
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete accommodation information?')) return;
    await onDelete();
    // Reset form data to initial state
    setFormData({
      type: 'hotel',
      name: '',
      address: '',
      checkInDate: defaultCheckIn,
      checkOutDate: defaultCheckOut,
      pricePerNight: undefined,
      notes: undefined,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <Select
          label="Type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as Accommodation['type'] })}
          options={[
            { value: 'hotel', label: 'Hotel' },
            { value: 'apartment', label: 'Apartment' },
            { value: 'hostel', label: 'Hostel' },
            { value: 'other', label: 'Other' },
          ]}
        />
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Check-in Date"
            type="date"
            value={formData.checkInDate}
            onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
            required
          />
          <Input
            label="Check-out Date"
            type="date"
            value={formData.checkOutDate}
            onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
            required
          />
        </div>
        <Input
          label="Price per Night"
          type="number"
          step="0.01"
          value={formData.pricePerNight || ''}
          onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value ? parseFloat(e.target.value) : undefined })}
          placeholder={`Amount in ${baseCurrency}`}
        />
        <Textarea
          label="Notes"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value || undefined })}
          rows={3}
        />
        <div className="flex gap-2">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (!accommodation) {
    return (
      <div>
        <p className="text-gray-500 dark:text-gray-400 mb-4">No accommodation information yet.</p>
        <Button onClick={() => setIsEditing(true)}>Add Accommodation</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
            <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{accommodation.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{accommodation.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{accommodation.address}</p>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Check-in</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {format(new Date(accommodation.checkInDate), 'MMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Check-out</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {format(new Date(accommodation.checkOutDate), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          {accommodation.pricePerNight && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Price per night</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {baseCurrency} {accommodation.pricePerNight}
              </p>
            </div>
          )}
          {accommodation.notes && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
              <p className="text-gray-900 dark:text-gray-100">{accommodation.notes}</p>
            </div>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDelete} className="text-red-600 dark:text-red-400">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};


