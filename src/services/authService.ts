import { supabase } from '../lib/supabase';
import { UserFetch } from '../app/utils/user-fetch';

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
    userType?: 'student' | 'parent';
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

    try {
      const data = await UserFetch.get<{ isAdmin: boolean }>('/api/auth/is-admin');
      return data.isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
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

  async signUpWithGoogle() {
    return this.signInWithGoogle();
  }
};
