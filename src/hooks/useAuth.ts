import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        const referralCode = localStorage.getItem('referralCode');
        if (referralCode) {
          localStorage.removeItem('referralCode');
          console.log('Referral code cleared from localStorage after login');
        }
      }

      return !error;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const loginWithGoogle = async () => {
    try {

      console.log('Current window origin:', typeof window !== 'undefined' ? window.location.origin : 'server-side');
      console.log('Environment variables:', {
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        NODE_ENV: process.env.NODE_ENV
      });

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      return !error;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    }
  };

  const logout = signOut; // Alias for consistency

  return {
    user,
    loading,
    signOut,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user
  };
}
