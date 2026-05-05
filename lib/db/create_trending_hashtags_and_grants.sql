-- Create view `public.trending_hashtags` and grant SELECT to anon/authenticated roles
-- Run this as a privileged user (schema owner) in your Postgres/Supabase database.

BEGIN;

-- Create view that aggregates hashtags from the jsonb `hashtags` array on posts
CREATE OR REPLACE VIEW public.trending_hashtags AS
SELECT
  lower(trim(both from h)) AS hashtag,
  count(*)::int AS usage_count
FROM (
  SELECT jsonb_array_elements_text(coalesce(hashtags, '[]'::jsonb)) AS h
  FROM public.posts
) t
WHERE h IS NOT NULL AND trim(both from h) <> ''
GROUP BY lower(trim(both from h))
ORDER BY usage_count DESC;

-- Grant SELECT to the anon and authenticated roles so the app can read the view
GRANT SELECT ON TABLE public.trending_hashtags TO anon;
GRANT SELECT ON TABLE public.trending_hashtags TO authenticated;

COMMIT;

-- Notes:
-- * If your app role is different, replace `anon`/`authenticated` with the appropriate role.
-- * If your posts table stores duplicate hashtags per post and you prefer to count a hashtag only once per post,
--   modify the inner select to dedupe per post id.
