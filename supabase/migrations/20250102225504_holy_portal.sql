/*
  # Create admins table and policies

  1. New Tables
    - `admins`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `admins` table
    - Add policy for authenticated users to read their own admin record
    - Add policy for super admins to manage other admins
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow admins to read own record"
  ON admins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow super admins to manage admins"
  ON admins
  FOR ALL
  TO authenticated
  USING (
    auth.email() IN ('admin@example.com') -- Replace with your super admin email
  );

-- Add updated_at trigger
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert initial admin
INSERT INTO admins (user_id)
SELECT id FROM auth.users
WHERE email = 'admin@example.com' -- Replace with your admin email
ON CONFLICT DO NOTHING;
