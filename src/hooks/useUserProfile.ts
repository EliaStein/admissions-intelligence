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

  const fetchUserData = useCallback(async () => {
    setError(null);

    if (authLoading) return;
    if (!user || !user.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('first_name, last_name, email, role, created_at')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profileData) throw new Error('Profile not found');

      setProfile(profileData as unknown as UserProfile);

      // Fetch essays
      const { data: essaysData, error: essaysError } = await supabase
        .from('essays')
        .select('*')
        .eq('student_email', user.email)
        .order('created_at', { ascending: false });

      if (essaysError) throw essaysError;
      setEssays((essaysData || []) as unknown as Essay[]);
    } catch (err) {
      console.error('Profile loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const refetchProfile = useCallback(async () => {
    await fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return useMemo(() => ({
    profile,
    essays,
    loading,
    error,
    refetchProfile,
    updateProfile,
  }), [profile, essays, loading, error, refetchProfile, updateProfile]);
}
