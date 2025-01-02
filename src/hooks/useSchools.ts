import { useState, useEffect, useCallback } from 'react';
import { schoolService } from '../services/schoolService';
import type { Database } from '../types/supabase';

type School = Database['public']['Tables']['schools']['Row'];

export function useSchools(initialQuery: string = '') {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const loadSchools = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 0 : page;
      const result = searchQuery
        ? await schoolService.searchSchools(searchQuery, currentPage)
        : await schoolService.getSchools(currentPage);

      setSchools(prev => reset ? result.schools : [...prev, ...result.schools]);
      setHasMore(result.hasMore);
      if (!reset) setPage(p => p + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schools');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(0);
    setSchools([]);
  }, []);

  useEffect(() => {
    loadSchools(true);
  }, [searchQuery]);

  useEffect(() => {
    const subscription = schoolService.subscribeToSchools((updatedSchools) => {
      setSchools(updatedSchools);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    schools,
    loading,
    error,
    hasMore,
    loadMore: () => loadSchools(false),
    handleSearch
  };
}
