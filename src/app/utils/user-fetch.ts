
import ky from 'ky';
import { supabase } from '@/lib/supabase';

async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No active session');
  }
  return session.access_token;
}

async function createAuthenticatedKy() {
  const token = await getAuthToken();
  return ky.create({
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

export const UserFetch = {
  async get<T>(url: string) {
    const authenticatedKy = await createAuthenticatedKy();
    return authenticatedKy.get<T>(url).json();
  },

  async post<T>(url: string, data?: any) {
    const authenticatedKy = await createAuthenticatedKy();
    return authenticatedKy.post<T>(url, { json: data }).json();
  },

  async put<T>(url: string, data?: any) {
    const authenticatedKy = await createAuthenticatedKy();
    return authenticatedKy.put<T>(url, { json: data }).json();
  },

  async patch<T>(url: string, data?: any) {
    const authenticatedKy = await createAuthenticatedKy();
    return authenticatedKy.patch<T>(url, { json: data }).json();
  },

  async delete<T>(url: string) {
    const authenticatedKy = await createAuthenticatedKy();
    return authenticatedKy.delete<T>(url).json();
  }
}