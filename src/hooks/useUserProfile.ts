import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Essay {
  id: string;
  selected_prompt: string;
  student_college: string | null;
  personal_statement: boolean;
  created_at: string;
  essay_content: string;
  essay_feedback: string | null;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  essays: Essay[];
  loading: boolean;
  error: string | null;
  refetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export function useUserProfile(): UseUserProfileReturn {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchUserData = useCallback(async () => {
    setError(null);

    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch user profile and essays in parallel for better performance
      const [profileResponse, essaysResponse] = await Promise.all([
        supabase
          .from('users')
          .select('first_name, last_name, email, role, created_at')
          .eq('id', user.id)
          .single(),
        supabase
          .from('essays')
          .select('*')
          .eq('student_email', user.email)
          .order('created_at', { ascending: false })
      ]);

      if (profileResponse.error) throw profileResponse.error;
      if (!profileResponse.data) throw new Error('Profile not found');

      setProfile(profileResponse.data);

      if (essaysResponse.error) throw essaysResponse.error;
      setEssays(essaysResponse.data || []);
    } catch (err) {
      console.error('Profile loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Memoize the update function
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Memoize the refetch function
  const refetchProfile = useCallback(async () => {
    await fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    profile,
    essays,
    loading,
    error,
    refetchProfile,
    updateProfile,
  }), [profile, essays, loading, error, refetchProfile, updateProfile]);
}
