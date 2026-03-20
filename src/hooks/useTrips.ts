import { useState, useEffect } from 'react';
import type { Trip } from '@/types';
import { apiAdapter } from '@/services/apiAdapter';

// Custom hook to fetch and manage all trips for the current user
export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to fetch trips from the API
  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiAdapter.getTrips();
      setTrips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch trips when component mounts
  useEffect(() => {
    fetchTrips();
  }, []);

  return { trips, loading, error, refetch: fetchTrips };
};
