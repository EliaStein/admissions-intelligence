import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = 'https://rpiwnxbkknlxouxmytgy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhcXBlb2lzYWZtdmNoa21zbHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTY1MzMsImV4cCI6MjA1MTQzMjUzM30.TDtlK2bTFvrZJy_5jnTE0t-5o9HvgM0Su-J-LJ0QZrg';

// Check if we're in development and using placeholder values
if (supabaseUrl === 'your-project-url' || supabaseAnonKey === 'your-anon-key') {
  throw new Error(
    'Please connect to Supabase:\n' +
    '1. Click the "Connect to Supabase" button in the top right corner\n' +
    '2. Follow the prompts to connect your project\n' +
    '3. The environment variables will be automatically updated'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(
    'Invalid Supabase URL format. Please ensure you have connected to Supabase properly.'
  );
}

let supabase;
try {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
} catch (error) {
  throw new Error(`Failed to create Supabase client: ${error.message}`);
}

export { supabase };