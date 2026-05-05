-- Fixed notifications insert policy: For INSERT only WITH CHECK expression is allowed.
-- Run this in Supabase SQL editor as DB owner or via service role.

BEGIN;

DROP POLICY IF EXISTS notifications_insert_allow ON public.notifications;

-- Allow service role to insert any notification, and allow authenticated users
-- to insert notifications that target themselves (user_id = auth.uid()).
CREATE POLICY notifications_insert_allow
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR user_id = auth.uid());

COMMIT;

-- Optional: enable RLS if not already enabled
-- ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
