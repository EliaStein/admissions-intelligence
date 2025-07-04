import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { supabaseAnonKey, supabaseUrl } from '../config/supabase';

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(
    'Invalid Supabase URL format. Please ensure you have connected to Supabase properly.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Ensure proper redirect handling
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true
  }
});
