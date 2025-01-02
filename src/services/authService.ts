import { supabase } from '../lib/supabase';

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
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
  }
};
