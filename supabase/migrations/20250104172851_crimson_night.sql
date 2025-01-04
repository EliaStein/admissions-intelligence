/*
  # Update RLS policies for admin access

  1. Changes
    - Update RLS policies to allow admins to insert/update data
    - Add policies for admins table access
    - Fix permission issues for data upload

  2. Security
    - Maintains read-only access for public users
    - Grants full access to authenticated admins
*/

-- Update schools policies
DROP POLICY IF EXISTS "Allow admin update access to schools" ON schools;
CREATE POLICY "Allow admin update access to schools"
  ON schools
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  );

-- Update essay_prompts policies
DROP POLICY IF EXISTS "Allow admin update access to essay_prompts" ON essay_prompts;
CREATE POLICY "Allow admin update access to essay_prompts"
  ON essay_prompts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  );
