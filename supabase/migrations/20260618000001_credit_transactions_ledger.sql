/*
  # Credit transactions ledger

  Credit balances were a single mutable integer with no history, so a failed
  refund (or any mismatch) was undetectable after the fact. This adds an
  append-only ledger and records every balance change inside the existing
  atomic credit RPCs, in the same transaction as the balance update.

  1. credit_transactions table (append-only, owner-readable via RLS).
  2. consume_user_credits / add_user_credits rewritten to insert a ledger row
     and accept an optional description. Only the service role may execute them.
*/

-- 1. Ledger table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,            -- signed: negative = consume, positive = add
  type text NOT NULL CHECK (type IN ('consume', 'add')),
  description text,
  balance_after integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS credit_transactions_user_id_created_at_idx
  ON public.credit_transactions (user_id, created_at DESC);

-- Owner can read their own ledger; writes happen only via SECURITY DEFINER
-- RPCs (service role), so no INSERT/UPDATE/DELETE policies are granted.
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own credit transactions" ON public.credit_transactions;
CREATE POLICY "Users can read own credit transactions"
  ON public.credit_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Rewrite the credit RPCs to record a ledger row. Drop first because we
-- are widening the signature with an optional description argument.
DROP FUNCTION IF EXISTS public.consume_user_credits(uuid, integer);
DROP FUNCTION IF EXISTS public.add_user_credits(uuid, integer);

CREATE OR REPLACE FUNCTION public.consume_user_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text DEFAULT NULL
)
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

  -- NULL means insufficient credits (or no such user): no ledger row.
  IF v_new_balance IS NOT NULL THEN
    INSERT INTO public.credit_transactions (user_id, amount, type, description, balance_after)
    VALUES (p_user_id, -p_amount, 'consume', p_description, v_new_balance);
  END IF;

  RETURN v_new_balance;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_user_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text DEFAULT NULL
)
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

  -- NULL means no such user: no ledger row.
  IF v_new_balance IS NOT NULL THEN
    INSERT INTO public.credit_transactions (user_id, amount, type, description, balance_after)
    VALUES (p_user_id, p_amount, 'add', p_description, v_new_balance);
  END IF;

  RETURN v_new_balance;
END;
$$;

-- Only the service role may spend or grant credits. Postgres grants EXECUTE to
-- PUBLIC by default, so the REVOKE below is what actually closes these off to
-- end users — and the GRANT is what keeps them open to us.
--
-- The GRANT is not redundant. If service_role's access came via PUBLIC rather
-- than its own grant, revoking PUBLIC would take service_role with it and
-- every credit operation would start failing the moment this migration runs —
-- before any code is deployed. Granting explicitly makes the outcome the same
-- either way.
--
-- Order matters: REVOKE first, then GRANT, so the grant cannot be revoked.
REVOKE EXECUTE ON FUNCTION public.consume_user_credits(uuid, integer, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.add_user_credits(uuid, integer, text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.consume_user_credits(uuid, integer, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.add_user_credits(uuid, integer, text) TO service_role;
