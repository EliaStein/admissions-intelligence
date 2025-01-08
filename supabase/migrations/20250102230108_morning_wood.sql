/*
  # Add new admin user

  1. Changes
    - Add elias.stein@gmail.com as an admin
    - Update RLS policies to include the new admin email

  2. Security
    - Maintains existing RLS policies
    - Adds new admin while preserving existing ones
*/

DO $$ 
BEGIN
  -- Update the admin policy
  DROP POLICY IF EXISTS "Allow super admins to manage admins" ON admins;
  CREATE POLICY "Allow super admins to manage admins"
    ON admins
    FOR ALL
    TO authenticated
    USING (
      auth.email() IN ('admin@example.com', 'elias.stein@gmail.com')
    );

  -- Update the schools policy
  DROP POLICY IF EXISTS "Allow admin update access to schools" ON schools;
  CREATE POLICY "Allow admin update access to schools"
    ON schools
    FOR ALL
    TO authenticated
    USING (auth.uid() IN (
      SELECT auth.uid() FROM auth.users 
      WHERE auth.email() IN ('admin@example.com', 'elias.stein@gmail.com')
    ));

  -- Update the essay_prompts policy
  DROP POLICY IF EXISTS "Allow admin update access to essay_prompts" ON essay_prompts;
  CREATE POLICY "Allow admin update access to essay_prompts"
    ON essay_prompts
    FOR ALL
    TO authenticated
    USING (auth.uid() IN (
      SELECT auth.uid() FROM auth.users 
      WHERE auth.email() IN ('admin@example.com', 'elias.stein@gmail.com')
    ));

  -- Insert the new admin if they exist
  INSERT INTO admins (user_id)
  SELECT id FROM auth.users
  WHERE email = 'elias.stein@gmail.com'
  ON CONFLICT DO NOTHING;
END $$;
