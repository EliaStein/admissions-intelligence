import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { CONFIG_KEYS, ConfigService } from '../services/configService';
import { supabaseUrl } from '../config/supabase';

// Access auth admin api
let adminAuthClient: SupabaseClient<any, "public", any> | null = null;

export async function getAdminClient() {
  if (adminAuthClient) return adminAuthClient;

  const service_role_key = await ConfigService.getConfigValue(CONFIG_KEYS.DB_SERVICE_ROLE_KEY);
  if (!service_role_key) throw new Error('Service role key not found in config table');

  const supabase = createClient(supabaseUrl, service_role_key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  return adminAuthClient = supabase;
}