-- Grant SELECT on the trending_hashtags view to anon and authenticated roles
-- Run this as a privileged user (owner/schema admin).

BEGIN;

-- Make sure the view exists before granting
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'trending_hashtags') THEN
    EXECUTE 'GRANT SELECT ON TABLE public.trending_hashtags TO anon';
    EXECUTE 'GRANT SELECT ON TABLE public.trending_hashtags TO authenticated';
  ELSE
    RAISE NOTICE 'View public.trending_hashtags does not exist; skipping GRANT';
  END IF;
END$$;

COMMIT;

-- Notes:
-- * Supabase typically exposes the roles `anon` and `authenticated` for public API access.
-- * If you prefer to allow only authenticated users, omit the `anon` grant.
-- * Run this migration from an admin connection (owner of the schema).
