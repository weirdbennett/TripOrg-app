import React, { useState, useEffect } from 'react';
import type { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiAdapter } from '@/services/apiAdapter';
import { getAvatarUrl } from '@/utils/avatar';

interface ParticipantInviteProps {
  tripId: string;
  currentParticipants: string[];
  createdBy: string;
  currentUserId?: string;
  onInvite: (userId: string) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
  onLeave: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export const ParticipantInvite: React.FC<ParticipantInviteProps> = ({
  tripId,
  currentParticipants,
  createdBy,
  currentUserId,
  onInvite,
  onRemove,
  onLeave,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current participants
  useEffect(() => {
    const loadParticipants = async () => {
      try {
        const users = await apiAdapter.getParticipants(tripId);
        setParticipants(users);
      } catch (err) {
        console.error('Failed to load participants:', err);
      }
    };
    loadParticipants();
  }, [tripId, currentParticipants]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await apiAdapter.searchUsers(searchQuery);
        // Filter out users who are already participants
        setSearchResults(results.filter(u => !currentParticipants.includes(u.id)));
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentParticipants]);

  const handleInvite = async (user: User) => {
    setIsLoading(true);
    setError(null);
    try {
      await onInvite(user.id);
      setSearchQuery('');
      setSearchResults([]);
      // Refresh participants
      const users = await apiAdapter.getParticipants(tripId);
      setParticipants(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this participant?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await onRemove(userId);
      // Refresh participants from server
      const users = await apiAdapter.getParticipants(tripId);
      setParticipants(users);
    } catch (err) {
      console.error('handleRemove error:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove participant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Input
          label="Invite Participant"
          placeholder="Search by name, nickname, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        {searchQuery.trim().length >= 2 && (
          <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {isSearching ? (
              <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {searchResults.map(user => (
                  <li key={user.id} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.displayName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.firstName} {user.lastName} • {user.email}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleInvite(user)}
                      disabled={isLoading}
                    >
                      Invite
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                No users found
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          Participants ({participants.length})
        </h4>
        {participants.length > 0 ? (
          <ul className="space-y-2">
            {participants.map(participant => {
              const isOwner = participant.id === createdBy;
              const canRemove = !isOwner && currentUserId === createdBy;
              
              return (
                <li key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getAvatarUrl(participant.avatar) ? (
                      <img
                        src={getAvatarUrl(participant.avatar)!}
                        alt={participant.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                          {participant.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {participant.displayName}
                        </p>
                        {isOwner && (
                          <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">
                            Owner
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {participant.email}
                      </p>
                    </div>
                  </div>
                  {canRemove && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemove(participant.id)}
                      disabled={isLoading}
                      className="text-red-600 dark:text-red-400"
                    >
                      Remove
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No participants yet.
          </p>
        )}
      </div>

      {currentUserId && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          {currentUserId === createdBy ? (
            <Button
              variant="secondary"
              onClick={async () => {
                if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
                  await onDelete();
                }
              }}
              disabled={isLoading}
              className="w-full text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete Trip
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={async () => {
                if (!confirm('Are you sure you want to leave this trip?')) return;
                
                setIsLoading(true);
                setError(null);
                try {
                  await onLeave();
                } catch (err) {
                  console.error('Leave trip error:', err);
                  setError(err instanceof Error ? err.message : 'Failed to leave trip');
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="w-full"
            >
              Leave Trip
            </Button>
          )}
        </div>
      )}
    </div>
  );
};


