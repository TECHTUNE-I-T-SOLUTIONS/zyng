-- users_insert_policy.sql
-- Idempotent script to allow authenticated users to INSERT their own row into public.users
-- Safe to run multiple times in Supabase SQL editor or via psql.

BEGIN;

-- Remove any existing insert policy with this name
DROP POLICY IF EXISTS users_insert_own ON public.users;

-- Allow INSERT when the new row's id matches the caller's auth UID
CREATE POLICY users_insert_own
  ON public.users
  FOR INSERT
  WITH CHECK (id = auth.uid());

COMMIT;

-- Notes:
-- 1) This permits an authenticated client to insert a `users` row only when they set `id` to their own auth UID.
-- 2) If your sign-up flow inserts from a server/service role, that call already bypasses RLS when using the service key.
-- 3) If you enable RLS on `public.users` and your triggers insert as a different role, you may need an additional
--    policy for the service role or use a server-side endpoint that uses the `service_role` key.
-- Example (uncomment if needed):
-- DROP POLICY IF EXISTS users_insert_service_role ON public.users;
-- CREATE POLICY users_insert_service_role ON public.users FOR INSERT USING (auth.role() = 'service_role') WITH CHECK (true);
