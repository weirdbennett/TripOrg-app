import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface EditableListProps {
  items: string[];
  onAdd: (item: string) => Promise<void>;
  onDelete: (index: number) => Promise<void>;
  onEdit: (index: number, newValue: string) => Promise<void>;
  placeholder?: string;
  label?: string;
}

export const EditableList: React.FC<EditableListProps> = ({
  items,
  onAdd,
  onDelete,
  onEdit,
  placeholder = 'Add item',
  label,
}) => {
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await onAdd(newItem.trim());
    setNewItem('');
  };

  const handleStartEdit = (index: number, currentValue: string) => {
    setEditingIndex(index);
    setEditValue(currentValue);
  };

  const handleSaveEdit = async (index: number) => {
    if (!editValue.trim()) return;
    await onEdit(index, editValue.trim());
    setEditingIndex(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    await onDelete(index);
  };

  return (
    <div className="space-y-4">
      {label && <h4 className="font-medium text-gray-900 dark:text-gray-100">{label}</h4>}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {editingIndex === index ? (
              <>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(index);
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={() => handleSaveEdit(index)}>
                  Save
                </Button>
                <Button size="sm" variant="secondary" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-gray-900 dark:text-gray-100 capitalize">{item}</span>
                <Button size="sm" variant="ghost" onClick={() => handleStartEdit(index, item)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(index)} className="text-red-600 dark:text-red-400">
                  Delete
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          className="flex-1"
        />
        <Button size="sm" onClick={handleAdd}>
          Add
        </Button>
      </div>
      {items.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No items yet.</p>
      )}
    </div>
  );
};


