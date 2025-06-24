/*
  # Config Table Schema

  1. New Tables
    - `config`
      - `id` (text, primary key) - The key name like 'SOME_API_KEY'
      - `value` (text) - The value for the key
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on config table
    - Add policies for admin access only (sensitive data)
*/

-- Create config table
CREATE TABLE IF NOT EXISTS config (
  id text PRIMARY KEY, -- Using id as the key name (e.g., 'SOME_API_KEY')
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Create policies - Only admins can access config data
CREATE POLICY "Allow admins to read config"
  ON config
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow admins to manage config"
  ON config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_config_updated_at
  BEFORE UPDATE ON config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
