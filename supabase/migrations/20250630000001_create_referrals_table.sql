-- Add referral_code to users table for tracking which referral code they used to sign up
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'referral_code_used'
  ) THEN
    ALTER TABLE users ADD COLUMN referral_code_used text;
    CREATE INDEX IF NOT EXISTS idx_users_referral_code_used ON users(referral_code_used);
  END IF;
END $$;
