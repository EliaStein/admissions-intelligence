/*
  # Fix RLS policies and remove auth.users references

  1. Changes
    - Remove references to auth.users table
    - Simplify policy checks to only use admins table
    - Update policies to use proper authentication checks
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
  )
  WITH CHECK (
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
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid()
    )
  );
