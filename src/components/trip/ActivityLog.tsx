import React, { useState, useEffect, useCallback } from 'react';
import type { ActivityLogEntry } from '@/types';
import { apiAdapter } from '@/services/apiAdapter';
import { format } from 'date-fns';

interface ActivityLogProps {
  tripId: string;
  refreshKey?: number;
  onRefreshReady?: (refreshFn: () => void) => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ tripId, refreshKey = 0, onRefreshReady }) => {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLog = useCallback(async () => {
    try {
      const data = await apiAdapter.getActivityLog(tripId);
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch activity log:', error);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchLog();
  }, [tripId, refreshKey, fetchLog]);

  // Expose refresh function to parent
  useEffect(() => {
    if (onRefreshReady) {
      onRefreshReady(fetchLog);
    }
  }, [onRefreshReady, fetchLog]);

  if (loading) {
    return <div className="text-gray-500 dark:text-gray-400">Loading activity log...</div>;
  }

  const getActionDescription = (entry: ActivityLogEntry): string => {
    switch (entry.actionType) {
      case 'create':
        return `created ${entry.entityType}`;
      case 'update':
        return `updated ${entry.entityType}${entry.fieldName ? ` (${entry.fieldName})` : ''}`;
      case 'delete':
        return `deleted ${entry.entityType}`;
      case 'add':
        if (entry.entityType === 'participant' && entry.newValue) {
          return `invited ${entry.newValue} to the trip`;
        }
        return `added ${entry.entityType}`;
      case 'leave':
        return 'left the trip';
      case 'remove':
        if (entry.entityType === 'participant' && entry.oldValue) {
          return `removed ${entry.oldValue} from the trip`;
        }
        return `removed ${entry.entityType}`;
      default:
        return `modified ${entry.entityType}`;
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {entries.map(entry => (
          <div
            key={entry.id}
            className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-primary-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  <span className="font-medium">{entry.userName}</span>{' '}
                  {getActionDescription(entry)}
                </p>
                {entry.oldValue && entry.newValue && (
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="line-through text-red-600 dark:text-red-400">{entry.oldValue}</span>
                    {' → '}
                    <span className="text-green-600 dark:text-green-400">{entry.newValue}</span>
                  </div>
                )}
                {entry.newValue && !entry.oldValue && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {entry.newValue}
                  </p>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-500 ml-4">
                {format(new Date(entry.timestamp), 'MMM d, HH:mm')}
              </span>
            </div>
          </div>
        ))}
      </div>
      {entries.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No activity yet.</p>
      )}
    </div>
  );
};

