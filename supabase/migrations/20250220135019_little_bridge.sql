/*
  # Add profiles table for Auth0 user management

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `auth0_user_id` (text, unique)
      - `email` (text)
      - `credits_remaining` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for authenticated users to read/update their own data
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_user_id text UNIQUE NOT NULL,
  email text NOT NULL,
  credits_remaining integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth0_user_id = current_user);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth0_user_id = current_user)
  WITH CHECK (auth0_user_id = current_user);
