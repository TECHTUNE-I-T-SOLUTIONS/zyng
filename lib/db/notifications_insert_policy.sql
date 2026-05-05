-- notifications_insert_policy.sql
-- Idempotent script to add an INSERT policy so triggers and authenticated users
-- can insert notifications without hitting RLS permission errors.

BEGIN;

-- Drop any existing INSERT policy
DROP POLICY IF EXISTS notifications_insert_allow ON public.notifications;

-- Allow service role to insert any notification, and allow authenticated users
-- to insert notifications that target themselves (user_id = auth.uid()).
CREATE POLICY notifications_insert_allow
  ON public.notifications
  FOR INSERT
  USING (auth.role() = 'service_role' OR user_id = auth.uid())
  WITH CHECK (auth.role() = 'service_role' OR user_id = auth.uid());

COMMIT;

-- Note: If RLS is not yet enabled on this table, enabling the policy is harmless.
-- To enable RLS for notifications (optional):
-- ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
