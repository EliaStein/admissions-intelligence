import 'server-only';
import { NextRequest } from 'next/server';
import { User } from '@supabase/supabase-js';
import { getAdminClient } from './supabase-admin-client';

/**
 * Verifies the Bearer token on an API request and returns the Supabase user.
 * Returns null when the header is missing or the token is invalid.
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const supabase = await getAdminClient();

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  return user;
}
