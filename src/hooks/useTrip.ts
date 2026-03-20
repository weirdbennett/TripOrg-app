import { useState, useEffect } from 'react';
import type { Trip } from '@/types';
import { apiAdapter } from '@/services/apiAdapter';

// Custom hook to fetch and manage a single trip's data
export const useTrip = (tripId: string | undefined) => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trip data whenever tripId changes
  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      return;
    }

    const fetchTrip = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiAdapter.getTrip(tripId);
        setTrip(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trip');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  // Allow manual refresh of trip data (useful after updates)
  const refetch = async () => {
    if (!tripId) return;
    try {
      const data = await apiAdapter.getTrip(tripId);
      setTrip(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trip');
    }
  };

  return { trip, loading, error, refetch };
};
