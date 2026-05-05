-- Migration: convert single `hashtag` text column to `hashtags` jsonb array
-- Adds `hashtags jsonb` column, backfills from `hashtag`, creates GIN index,
-- and drops the legacy `idx_posts_hashtag` index (keeps `hashtag` column for now).
-- Run this using your DB migration runner or psql as a privileged user.

BEGIN;

-- 1) Add new jsonb column (if not exists)
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS hashtags jsonb DEFAULT '[]'::jsonb;

-- 2) Backfill `hashtags` from existing `hashtag` text column.
--    Splits on whitespace, strips leading '#' characters, deduplicates per post,
--    and stores as a JSON array of strings. Leaves empty array if no tags.
UPDATE public.posts
SET hashtags = COALESCE(
  (
    SELECT jsonb_agg(elem_clean) FROM (
      SELECT DISTINCT regexp_replace(elem, '^#', '') AS elem_clean
      FROM unnest(regexp_split_to_array(coalesce(hashtag, ''), E'\s+')) AS elem
      WHERE elem IS NOT NULL AND trim(both from elem) <> ''
    ) t
  ), '[]'::jsonb
)
WHERE hashtag IS NOT NULL AND trim(both from hashtag) <> '';

-- 3) Create a GIN index for fast lookups on hashtags (jsonb array)
CREATE INDEX IF NOT EXISTS idx_posts_hashtags_gin ON public.posts USING gin (hashtags);

-- 4) Drop old single-hashtag text index if present (we keep the column for compatibility)
DROP INDEX IF EXISTS idx_posts_hashtag;

COMMIT;

-- After deploying this migration you should:
--  - Update application code to write `hashtags` (jsonb array) when creating/updating posts.
--  - Optionally keep `hashtag` as backward-compatibility or drop it in a follow-up migration
--    once the app no longer relies on it.
