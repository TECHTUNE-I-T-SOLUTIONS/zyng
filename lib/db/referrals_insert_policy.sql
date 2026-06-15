-- referrals_insert_policy.sql
-- Idempotent script to let signup and referral flows create rows in public.referrals
-- without tripping RLS. Run this in the Supabase SQL editor as DB owner.

BEGIN;

-- Make sure RLS is on so the policy actually applies.
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Remove older versions of the policy if they exist.
DROP POLICY IF EXISTS referrals_insert_allow ON public.referrals;

-- Allow the service role to insert any referral row.
-- Also allow authenticated users to create referral rows that involve their own account.
CREATE POLICY referrals_insert_allow
  ON public.referrals
  FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role'
    OR referrer_id = auth.uid()
    OR referred_user_id = auth.uid()
  );

COMMIT;

-- Optional companion policies if you want users to read their own referral rows:
-- DROP POLICY IF EXISTS referrals_select_own ON public.referrals;
-- CREATE POLICY referrals_select_own
--   ON public.referrals
--   FOR SELECT
--   USING (
--     auth.role() = 'service_role'
--     OR referrer_id = auth.uid()
--     OR referred_user_id = auth.uid()
--   );
