/*
  # Referral System Schema

  1. New Tables
    - `referrals`
      - `id` (uuid, primary key)
      - `referrer_id` (uuid, foreign key to users) - The user who made the referral
      - `referee_id` (uuid, foreign key to users, nullable) - The user who was referred (null until they sign up)
      - `referee_email` (text) - Email of the referred user
      - `referral_code` (text, unique) - Unique referral code/link identifier
      - `viral_loops_participant_id` (text, nullable) - Viral Loops participant ID
      - `signup_completed` (boolean, default false) - Whether the referee has signed up
      - `payment_completed` (boolean, default false) - Whether the referee has made their first payment
      - `reward_given` (boolean, default false) - Whether the referrer has received their reward
      - `created_at` (timestamp)
      - `signup_at` (timestamp, nullable) - When the referee signed up
      - `payment_at` (timestamp, nullable) - When the referee made their first payment
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on referrals table
    - Add policies for users to read their own referrals
    - Add policies for admins to manage all referrals
*/

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  referee_id uuid REFERENCES users(id) ON DELETE SET NULL,
  referee_email text NOT NULL,
  referral_code text UNIQUE NOT NULL,
  viral_loops_participant_id text,
  signup_completed boolean DEFAULT false,
  payment_completed boolean DEFAULT false,
  reward_given boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  signup_at timestamptz,
  payment_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_email ON referrals(referee_email);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_viral_loops_participant_id ON referrals(viral_loops_participant_id);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own referrals as referrer"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can read their own referrals as referee"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referee_id);

CREATE POLICY "Users can insert referrals they create"
  ON referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "System can update referrals for signup/payment tracking"
  ON referrals
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage all referrals"
  ON referrals
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

-- Add updated_at trigger
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

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
