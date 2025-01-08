/*
  # Essay System Schema

  1. New Tables
    - `schools`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    - `essay_prompts`
      - `id` (uuid, primary key)
      - `school_id` (uuid, foreign key)
      - `prompt` (text)
      - `word_count` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read data
*/

-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create essay prompts table
CREATE TABLE IF NOT EXISTS essay_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  word_count integer NOT NULL CHECK (word_count > 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE essay_prompts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read schools"
  ON schools
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read prompts"
  ON essay_prompts
  FOR SELECT
  TO authenticated
  USING (true);