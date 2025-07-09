import 'server-only';
import { createServerClient } from '@supabase/ssr'
import { CONFIG_KEYS, ConfigService } from '../services/configService';
import { supabaseUrl } from '../config/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers'

// Access auth admin api
let adminAuthClient: SupabaseClient<any, "public", any> | null = null;

export async function getAdminClient() {
  if (adminAuthClient) return adminAuthClient;
  const cookieStore = await cookies()

  const service_role_key = await ConfigService.getConfigValue(CONFIG_KEYS.DB_SERVICE_ROLE_KEY);
  if (!service_role_key) throw new Error('Service role key not found in config table');

  const supabase = createServerClient(supabaseUrl, service_role_key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
  return adminAuthClient = supabase;
}