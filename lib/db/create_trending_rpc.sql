-- Create a SECURITY DEFINER function to return trending hashtags and grant EXECUTE to anon/authenticated
-- Run this as a privileged user (schema owner) in your Postgres/Supabase database.

BEGIN;

CREATE OR REPLACE FUNCTION public.get_trending_hashtags(p_limit integer DEFAULT 10)
RETURNS TABLE (hashtag text, usage_count integer) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lower(trim(both from h)) AS hashtag,
    count(*)::int AS usage_count
  FROM (
    SELECT jsonb_array_elements_text(coalesce(hashtags, '[]'::jsonb)) AS h
    FROM public.posts
  ) t
  WHERE h IS NOT NULL AND trim(both from h) <> ''
  GROUP BY lower(trim(both from h))
  ORDER BY usage_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute so the anon client can call the RPC
GRANT EXECUTE ON FUNCTION public.get_trending_hashtags(integer) TO anon;
GRANT EXECUTE ON FUNCTION public.get_trending_hashtags(integer) TO authenticated;

COMMIT;

-- Notes:
-- * SECURITY DEFINER makes the function run with the owner's privileges and bypass RLS on underlying tables.
-- * Make sure the function owner is a role that has access to the underlying tables (the DB owner/service role).
-- * After creating this function, the app can call it via Supabase RPC: `supabase.rpc('get_trending_hashtags', { p_limit: 10 })`.
