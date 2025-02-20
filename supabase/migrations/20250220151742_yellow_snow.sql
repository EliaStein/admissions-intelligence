/*
  # Add Essays Table

  1. New Tables
    - `essays`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `school_id` (uuid, references schools, nullable)
      - `prompt` (text)
      - `essay_content` (text)
      - `word_count` (integer)
      - `is_personal_statement` (boolean)
      - `feedback_status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `essays` table
    - Add policies for users to:
      - Read their own essays
      - Create new essays
      - Update their own essays
*/

-- Create essays table
CREATE TABLE IF NOT EXISTS essays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  school_id uuid REFERENCES schools(id) ON DELETE SET NULL,
  prompt text NOT NULL,
  essay_content text NOT NULL,
  word_count integer NOT NULL CHECK (word_count > 0),
  is_personal_statement boolean NOT NULL DEFAULT false,
  feedback_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER update_essays_updated_at
  BEFORE UPDATE ON essays
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create policies
CREATE POLICY "Users can read own essays"
  ON essays
  FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE auth0_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create essays"
  ON essays
  FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE auth0_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own essays"
  ON essays
  FOR UPDATE
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE auth0_user_id = auth.uid()
    )
  )
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE auth0_user_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX essays_profile_id_idx ON essays(profile_id);
CREATE INDEX essays_school_id_idx ON essays(school_id);
CREATE INDEX essays_feedback_status_idx ON essays(feedback_status);
