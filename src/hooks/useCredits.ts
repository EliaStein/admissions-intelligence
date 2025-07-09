import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { UserFetch } from '../app/utils/user-fetch';
import { ActionPersistenceService } from '../services/actionPersistenceService';

export function useCredits() {
  const { user, loading: authLoading } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await UserFetch.get<{ credits: number }>('/api/credits/balance');
      setCredits(data.credits);

      const pending = ActionPersistenceService.getPendingRequirement();
      if (data.credits > 0 && pending === 'credit') {
        ActionPersistenceService.clearPendingRequirement();
      }
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch credits');
      setCredits(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) {
      fetchCredits();
    }
  }, [authLoading, fetchCredits]);

  return useMemo(() => ({
    credits,
    loading,
    error,
    refetch: fetchCredits
  }), [credits, loading, error, fetchCredits]);
}
