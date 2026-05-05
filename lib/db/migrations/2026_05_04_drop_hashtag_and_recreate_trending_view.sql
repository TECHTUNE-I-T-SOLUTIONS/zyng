-- Migration: drop legacy `hashtag` column and recreate `trending_hashtags` view
-- Drops the single-text `hashtag` column (if present) and recreates the view
-- to aggregate counts from the new `hashtags` jsonb array.
-- Run as a privileged user (schema owner).

BEGIN;

-- Ensure dependent objects (view/index) are removed before dropping the column.
-- 1) Drop the view if it exists (it may depend on `posts.hashtag`).
DROP VIEW IF EXISTS public.trending_hashtags;

-- 2) Drop legacy index on `hashtag` if present (depends on the column).
DROP INDEX IF EXISTS idx_posts_hashtag;

-- 3) Drop the legacy `hashtag` column (keep backup before running in production if needed)
ALTER TABLE IF EXISTS public.posts DROP COLUMN IF EXISTS hashtag;

-- 4) Recreate trending_hashtags view from jsonb `hashtags` array
CREATE VIEW public.trending_hashtags AS
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

COMMIT;

-- Notes:
-- * This view counts each post once per hashtag occurrence. If posts can contain duplicates
--   in their `hashtags` array and you want to dedupe per-post, consider wrapping the
--   inner selection with DISTINCT per post id.
-- * If you need the view to be selectable by anon/authenticated roles, run the grant SQL
--   from `lib/db/grant_select_trending_hashtags.sql` after applying migrations.
