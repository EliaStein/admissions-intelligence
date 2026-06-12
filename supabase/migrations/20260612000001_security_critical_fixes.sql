/*
  # Security: critical fixes

  1. Drop the anon read policy on config (exposed backend secrets to anyone
     with the public anon key; code reads process.env now).
  2. Block clients from updating users.credits / users.role directly.
     The "Users can update own profile" RLS policy allows updating the whole
     row, which let any user set their own credit balance (and role).
  3. Enable RLS on essays with owner-scoped policies (table previously had
     no RLS — any anon-key holder could read/delete every essay).
  4. Atomic credit functions so balance changes are single-statement
     (the old read-then-write pattern lost updates under concurrency).
  5. stripe_events table for webhook idempotency (Stripe retries deliveries).
*/

-- 1. config: remove anon read access (table may not exist in all envs)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'config'
  ) THEN
    DROP POLICY IF EXISTS "Allow anonymous read access to config" ON public.config;
  END IF;
END $$;

-- 2. users: protect credits/role from client-side updates.
-- SECURITY INVOKER (default) so current_user reflects the API role:
-- PostgREST runs as anon/authenticated for client requests and as
-- service_role for server requests; SQL editor/migrations run as postgres.
CREATE OR REPLACE FUNCTION public.protect_users_sensitive_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (to_jsonb(NEW) -> 'credits' IS DISTINCT FROM to_jsonb(OLD) -> 'credits'
      OR to_jsonb(NEW) -> 'role' IS DISTINCT FROM to_jsonb(OLD) -> 'role')
     AND current_user NOT IN ('postgres', 'supabase_admin', 'service_role') THEN
    RAISE EXCEPTION 'credits and role can only be modified by the server';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_users_sensitive_columns ON users;
CREATE TRIGGER protect_users_sensitive_columns
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_users_sensitive_columns();

-- 3. essays: enable RLS, owner-scoped by student_email.
-- Inserts and feedback updates go through server routes (service role,
-- bypasses RLS), so clients only need SELECT and DELETE on their own rows.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'essays'
  ) THEN
    ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can read own essays" ON public.essays;
    DROP POLICY IF EXISTS "Users can delete own essays" ON public.essays;

    CREATE POLICY "Users can read own essays"
      ON public.essays
      FOR SELECT
      TO authenticated
      USING (student_email = auth.email());

    CREATE POLICY "Users can delete own essays"
      ON public.essays
      FOR DELETE
      TO authenticated
      USING (student_email = auth.email());
  END IF;
END $$;

-- 4. Atomic credit mutations. SECURITY DEFINER so the sensitive-column
-- trigger sees a privileged current_user; execution is revoked from
-- client roles — only the service role (server) may call these.
CREATE OR REPLACE FUNCTION public.consume_user_credits(p_user_id uuid, p_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;

  UPDATE public.users
  SET credits = credits - p_amount
  WHERE id = p_user_id AND credits >= p_amount
  RETURNING credits INTO v_new_balance;

  RETURN v_new_balance; -- NULL means insufficient credits (or no such user)
END;
$$;

CREATE OR REPLACE FUNCTION public.add_user_credits(p_user_id uuid, p_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;

  UPDATE public.users
  SET credits = credits + p_amount
  WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;

  RETURN v_new_balance; -- NULL means no such user
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_user_credits(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.add_user_credits(uuid, integer) FROM PUBLIC, anon, authenticated;

-- 5. Webhook idempotency. RLS enabled with no policies: only the service
-- role can touch it.
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id text PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
