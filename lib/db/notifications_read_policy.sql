-- notifications_read_policy.sql
-- Idempotent script to add a SELECT policy so users can read their own notifications.
-- Safe to run multiple times. This script only creates the SELECT policy.
-- If RLS is not enabled on the table, creating the policy is harmless; it will take effect once RLS is enabled.
-- IMPORTANT: If you enable RLS on this table, make sure you also add appropriate INSERT policies
-- (or use service-role inserts) so trigger-based inserts are not blocked.

BEGIN;

-- Drop prior policy if present
DROP POLICY IF EXISTS notifications_select_own ON public.notifications;

-- Allow users to SELECT only rows where notifications.user_id matches their auth UID
CREATE POLICY notifications_select_own
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

COMMIT;

-- Optional (UNCOMMENT with CAUTION): enable RLS for notifications.
-- Note: enabling RLS without INSERT policies may block existing trigger inserts.
-- ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- If you plan to enable RLS now and you need triggers or authenticated callers
-- to be able to INSERT notifications for other users, add an INSERT policy.
-- Example (use with caution - this allows authenticated callers to INSERT rows):
-- DROP POLICY IF EXISTS notifications_insert_allow ON public.notifications;
-- CREATE POLICY notifications_insert_allow
--   ON public.notifications
--   FOR INSERT
--   USING (auth.role() = 'authenticated' OR auth.role() = 'service_role')
--   WITH CHECK (true);
