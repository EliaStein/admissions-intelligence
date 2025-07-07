import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserFetch } from '../app/utils/user-fetch';

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await UserFetch.get<{ credits: number }>('/api/credits/balance');
      setCredits(data.credits);
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch credits');
      setCredits(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    loading,
    error,
    refetch: fetchCredits
  };
}
