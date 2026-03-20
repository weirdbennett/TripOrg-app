import React, { useState, useEffect } from 'react';
import type { TicketFile, TransportType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { format } from 'date-fns';

interface EditableTicketsProps {
  transportType: TransportType;
  ticketsStatus: 'purchased' | 'not_purchased';
  ticketPrice?: number;
  ticketFiles: TicketFile[];
  baseCurrency: string;
  onUpdateTransport: (transportType: TransportType, ticketsStatus: 'purchased' | 'not_purchased', ticketPrice?: number) => Promise<void>;
  onUploadFile: (file: File) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  onDownloadFile: (fileId: string, fileName: string) => Promise<void>;
  onDeleteTransport?: () => Promise<void>;
}

export const EditableTickets: React.FC<EditableTicketsProps> = ({
  transportType,
  ticketsStatus,
  ticketPrice,
  ticketFiles,
  baseCurrency,
  onUpdateTransport,
  onUploadFile,
  onDeleteFile,
  onDownloadFile,
  onDeleteTransport,
}) => {
  // Check if transport data has been set, ticketPrice can be null from backend, so we need to check for both null and undefined
  const hasData = (ticketPrice != null && ticketPrice > 0) || ticketFiles.length > 0 || ticketsStatus === 'purchased';
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [localTransportType, setLocalTransportType] = useState(transportType);
  const [localTicketsStatus, setLocalTicketsStatus] = useState(ticketsStatus);
  const [localTicketPrice, setLocalTicketPrice] = useState(ticketPrice?.toString() || '');

  // Sync local state when props change
  useEffect(() => {
    setLocalTransportType(transportType);
    setLocalTicketsStatus(ticketsStatus);
    setLocalTicketPrice(ticketPrice?.toString() || '');
  }, [transportType, ticketsStatus, ticketPrice]);

  const handleSaveTransport = async () => {
    await onUpdateTransport(
      localTransportType, 
      localTicketsStatus, 
      localTicketPrice ? parseFloat(localTicketPrice) : undefined
    );
    setIsEditing(false);
    setIsAdding(false);
  };

  const handleDeleteTransport = async () => {
    if (!confirm('Are you sure you want to delete transport information?')) return;
    if (onDeleteTransport) {
      await onDeleteTransport();
    }
  };

  const handleCancel = () => {
    setLocalTransportType(transportType);
    setLocalTicketsStatus(ticketsStatus);
    setLocalTicketPrice(ticketPrice?.toString() || '');
    setIsEditing(false);
    setIsAdding(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }
    await onUploadFile(file);
    e.target.value = '';
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    await onDeleteFile(fileId);
  };

  // Show empty state if no data has been set
  if (!hasData && !isAdding) {
    return (
      <div>
        <p className="text-gray-500 dark:text-gray-400 mb-4">No information added yet.</p>
        <Button onClick={() => setIsAdding(true)}>Add Tickets & Transport</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(isEditing || isAdding) ? (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <Select
            label="Transport Type"
            value={localTransportType}
            onChange={(e) => setLocalTransportType(e.target.value as TransportType)}
            options={[
              { value: 'plane', label: 'Plane' },
              { value: 'train', label: 'Train' },
              { value: 'car', label: 'Car' },
              { value: 'bus', label: 'Bus' },
              { value: 'mixed', label: 'Mixed' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Select
            label="Tickets Status"
            value={localTicketsStatus}
            onChange={(e) => setLocalTicketsStatus(e.target.value as 'purchased' | 'not_purchased')}
            options={[
              { value: 'purchased', label: 'Purchased' },
              { value: 'not_purchased', label: 'Not Purchased' },
            ]}
          />
          <Input
            label="Ticket Price (Total)"
            type="number"
            step="0.01"
            value={localTicketPrice}
            onChange={(e) => setLocalTicketPrice(e.target.value)}
            placeholder={`Amount in ${baseCurrency}`}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveTransport}>
              Save
            </Button>
            <Button size="sm" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Transport Type</p>
                <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{transportType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {ticketsStatus.replace('_', ' ')}
                </p>
              </div>
              {ticketPrice !== undefined && ticketPrice > 0 && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {baseCurrency} {ticketPrice.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              {onDeleteTransport && (
                <Button size="sm" variant="ghost" onClick={handleDeleteTransport} className="text-red-600 dark:text-red-400">
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Show ticket files section only when status is "purchased" */}
      {ticketsStatus === 'purchased' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Ticket Files</h4>
            <label className="cursor-pointer inline-flex">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500">
                + Upload PDF
              </span>
            </label>
          </div>
          {ticketFiles.length > 0 ? (
            <div className="space-y-2">
              {ticketFiles.map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.fileName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {(file.fileSize / 1024).toFixed(2)} KB • {format(new Date(file.uploadedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onDownloadFile(file.id, file.fileName)}
                    >
                      Download
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteFile(file.id)} className="text-red-600 dark:text-red-400">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No ticket files uploaded yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

