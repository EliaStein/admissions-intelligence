/*
  # Schools and Essay Prompts Schema

  1. New Tables
    - `schools`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `essay_prompts`
      - `id` (uuid, primary key) 
      - `school_id` (uuid, foreign key)
      - `prompt` (text)
      - `word_count` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read data
    - Add policies for admin users to modify data
*/

-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create essay_prompts table
CREATE TABLE IF NOT EXISTS essay_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  word_count text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE essay_prompts ENABLE ROW LEVEL SECURITY;

-- Create policies for schools
CREATE POLICY "Allow public read access to schools"
  ON schools
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin update access to schools"
  ON schools
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users 
    WHERE auth.email() IN ('admin@example.com')
  ));

-- Create policies for essay_prompts
CREATE POLICY "Allow public read access to essay_prompts"
  ON essay_prompts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin update access to essay_prompts"
  ON essay_prompts
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users 
    WHERE auth.email() IN ('admin@example.com')
  ));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_essay_prompts_updated_at
  BEFORE UPDATE ON essay_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
