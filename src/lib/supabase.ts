import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = 'https://rpiwnxbkknlxouxmytgy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwaXdueGJra25seG91eG15dGd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTc3MDUsImV4cCI6MjA1MTQzMzcwNX0.FW0jlpyjyAPOnHDKMKpVj05RQJEHpxAnGJK2PHPo5gU';

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

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
