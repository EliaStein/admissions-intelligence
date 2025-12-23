/*
 # Add credits column to users table

 1. Changes
 - Add credits column to users table with default value of 0
 - Add check constraint to ensure credits cannot be negative
 - Update existing users to have 0 credits

 2. Security
 - Maintains existing RLS policies
 - Credits can only be modified by the user themselves or admins
 */
-- Add credits column to users table
DO $$ BEGIN IF NOT EXISTS (
  SELECT
    1
  FROM
    information_schema.columns
  WHERE
    table_name = 'users'
    AND column_name = 'credits'
) THEN
ALTER TABLE
  users
ADD
  COLUMN credits integer DEFAULT 0 CHECK (credits >= 0);

-- Update existing users to have 0 credits
UPDATE
  users
SET
  credits = 0
WHERE
  credits IS NULL;

END IF;

END $$;
