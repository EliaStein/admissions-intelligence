/*
  # Allow anonymous access to config table for API operations
  
  This migration adds a policy to allow anonymous (service) access to read config values.
  This is needed for server-side API routes to access configuration without authentication.
*/

-- Add policy to allow anonymous access to read config (for server-side API operations)
CREATE POLICY "Allow anonymous read access to config"
  ON config
  FOR SELECT
  TO anon
  USING (true);
