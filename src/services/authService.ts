import { supabase } from '../lib/supabase';

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (typeof window !== 'undefined') {
      const referralCode = localStorage.getItem('referralCode');
      if (referralCode) {
        localStorage.removeItem('referralCode');
      }
    }

    return data;
  },

  async signUp(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    referralCode?: string;
  }) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }
    await this.signIn(userData.email, userData.password);
    return await response.json();
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async isAdmin() {
    const session = await this.getCurrentSession();
    if (!session) return false;

    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    return !error && data !== null;
  },

  async signInWithGoogle(redirectTo?: string) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        // Keep existing query params for offline access
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      },
    });

    if (error) {
      console.error('❌ Google OAuth error:', error);
      throw error;
    }

    return data;
  },

  async signUpWithGoogle(redirectTo?: string) {
    return this.signInWithGoogle(redirectTo);
  }
};
