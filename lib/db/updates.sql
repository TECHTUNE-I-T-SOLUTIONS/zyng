-- Zyng DB updates: add hashtag, create views, events & marketplace tables, and RLS policies

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Add hashtag column to posts (nullable)
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS hashtag TEXT;

-- Optional index for faster hashtag queries
CREATE INDEX IF NOT EXISTS idx_posts_hashtag ON posts (lower(hashtag));

-- 2) Create view to show trending hashtags
CREATE OR REPLACE VIEW trending_hashtags AS
SELECT
  hashtag,
  COUNT(*) AS usage_count
FROM posts
WHERE hashtag IS NOT NULL AND TRIM(hashtag) <> ''
GROUP BY hashtag
ORDER BY usage_count DESC;

-- 3) Create a simple platform_mood view derived from keyword heuristics
-- Note: This is a lightweight heuristic using regex; consider replacing with a proper sentiment service later.
CREATE OR REPLACE VIEW platform_mood AS
SELECT
  SUM(
    CASE
      WHEN content ~* '\\m(happy|great|love|excited|awesome|good|yay|joy|fun)\\M' THEN 1
      WHEN content ~* '\\m(sad|angry|hate|terrible|awful|bad|ugh|upset|depress)\\M' THEN -1
      ELSE 0
    END
  ) AS mood_score,
  COUNT(*) AS total_posts,
  ROUND((SUM(CASE WHEN content ~* '\\m(happy|great|love|excited|awesome|good|yay|joy|fun)\\M' THEN 1 ELSE 0 END)::numeric / GREATEST(COUNT(*),1)) * 100,2) AS positive_pct,
  ROUND((SUM(CASE WHEN content ~* '\\m(sad|angry|hate|terrible|awful|bad|ugh|upset|depress)\\M' THEN 1 ELSE 0 END)::numeric / GREATEST(COUNT(*),1)) * 100,2) AS negative_pct
FROM posts;

-- 4) Create zing_events table
CREATE TABLE IF NOT EXISTS zing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  cover_image TEXT,
  tags TEXT[],
  category TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5) Create zing_marketplace table
CREATE TABLE IF NOT EXISTS zing_marketplace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  currency TEXT DEFAULT 'NGN',
  is_sold BOOLEAN DEFAULT false,
  media_url TEXT,
  images TEXT[],
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8) Add attachments to opportunities (images/documents allowed) and avatar to users
ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- users avatar URL
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Ensure opportunities attachments are optional; apps should validate allowed mime types (images/documents)

-- 9) Add images column to zing_events if needed (redundant if cover_image used)
ALTER TABLE IF EXISTS zing_events
  ADD COLUMN IF NOT EXISTS images TEXT[];

-- 10) Enable RLS and policies for users so users can read/update their own profile
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_select_own ON users;
CREATE POLICY users_select_own ON users FOR SELECT USING (id = auth.uid());
DROP POLICY IF EXISTS users_update_own ON users;
CREATE POLICY users_update_own ON users FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- 11) Notification functions: notify users whose skills/hobbies match new opportunities or events

CREATE OR REPLACE FUNCTION fn_notify_event_matches()
RETURNS TRIGGER AS $$
DECLARE
  matched RECORD;
BEGIN
  -- Only proceed if tags are provided
  IF COALESCE(NEW.tags, ARRAY[]::text[]) = ARRAY[]::text[] THEN
    RETURN NEW;
  END IF;

  -- Notify users in same school whose skills or hobbies overlap with event tags
  FOR matched IN
    SELECT DISTINCT u.id
    FROM users u
    WHERE u.id IS NOT NULL
      AND u.id <> NEW.created_by
      AND (u.school_id IS NULL OR u.school_id = NEW.school_id)
      AND (
        coalesce(u.skills, ARRAY[]::text[]) && coalesce(NEW.tags, ARRAY[]::text[])
        OR coalesce(u.hobbies, ARRAY[]::text[]) && coalesce(NEW.tags, ARRAY[]::text[])
      )
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (matched.id, 'event_relevant', 'Event: ' || NEW.title, 'An event matching your interests is happening: ' || COALESCE(NEW.title, ''), '/z-events/' || NEW.id);
  END LOOP;

  -- Admin notification for new event
  INSERT INTO admin_notifications (target_level, type, title, message)
  VALUES (
    'moderator',
    'event_created',
    'Event Created',
    'Event "' || COALESCE(NEW.title, '') || '" was created.'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure we don't fail if the trigger already exists when re-running this script
DROP TRIGGER IF EXISTS tr_on_zing_event ON zing_events;
CREATE TRIGGER tr_on_zing_event AFTER INSERT ON zing_events FOR EACH ROW EXECUTE FUNCTION fn_notify_event_matches();

CREATE OR REPLACE FUNCTION fn_notify_opportunity_matches()
RETURNS TRIGGER AS $$
DECLARE
  matched RECORD;
BEGIN
  IF COALESCE(NEW.skills_required, ARRAY[]::text[]) = ARRAY[]::text[] THEN
    RETURN NEW;
  END IF;

  FOR matched IN
    SELECT DISTINCT u.id
    FROM users u
    WHERE u.id IS NOT NULL
      AND u.id <> NEW.posted_by
      AND (u.school_id IS NULL OR u.school_id = NEW.school_id)
      AND (
        coalesce(u.skills, ARRAY[]::text[]) && coalesce(NEW.skills_required, ARRAY[]::text[])
        OR coalesce(u.hobbies, ARRAY[]::text[]) && coalesce(NEW.skills_required, ARRAY[]::text[])
      )
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (matched.id, 'opportunity_match', 'Opportunity: ' || NEW.title, 'A new opportunity matches your skills: ' || COALESCE(NEW.title, ''), '/z-jobs/' || NEW.id);
  END LOOP;

  INSERT INTO admin_notifications (target_level, type, title, message)
  VALUES (
    'moderator',
    'opportunity_created',
    'Opportunity Posted',
    'Opportunity "' || COALESCE(NEW.title, '') || '" was posted.'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure we don't fail if the trigger already exists when re-running this script
DROP TRIGGER IF EXISTS tr_on_opportunity ON opportunities;
CREATE TRIGGER tr_on_opportunity AFTER INSERT ON opportunities FOR EACH ROW EXECUTE FUNCTION fn_notify_opportunity_matches();

-- 6) Enable RLS and policies for personas and posts (allow users to insert their own rows)
-- Personas
ALTER TABLE IF EXISTS personas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS personas_select_all ON personas;
CREATE POLICY personas_select_all ON personas FOR SELECT USING (true);
DROP POLICY IF EXISTS personas_insert_own ON personas;
CREATE POLICY personas_insert_own ON personas FOR INSERT WITH CHECK (user_id = auth.uid());

-- Posts
ALTER TABLE IF EXISTS posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS posts_select_all ON posts;
CREATE POLICY posts_select_all ON posts FOR SELECT USING (true);
DROP POLICY IF EXISTS posts_insert_owner ON posts;
CREATE POLICY posts_insert_owner ON posts FOR INSERT WITH CHECK (user_id = auth.uid());

-- Events
ALTER TABLE IF EXISTS zing_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zing_events_select_all ON zing_events;
CREATE POLICY zing_events_select_all ON zing_events FOR SELECT USING (true);
DROP POLICY IF EXISTS zing_events_insert_auth ON zing_events;
CREATE POLICY zing_events_insert_auth ON zing_events FOR INSERT WITH CHECK (created_by = auth.uid());

-- Marketplace
ALTER TABLE IF EXISTS zing_marketplace ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zing_marketplace_select_all ON zing_marketplace;
CREATE POLICY zing_marketplace_select_all ON zing_marketplace FOR SELECT USING (true);
DROP POLICY IF EXISTS zing_marketplace_insert_auth ON zing_marketplace;
CREATE POLICY zing_marketplace_insert_auth ON zing_marketplace FOR INSERT WITH CHECK (created_by = auth.uid());

-- Opportunities (jobs) RLS
ALTER TABLE IF EXISTS opportunities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS opportunities_select_all ON opportunities;
CREATE POLICY opportunities_select_all ON opportunities FOR SELECT USING (true);
DROP POLICY IF EXISTS opportunities_insert_auth ON opportunities;
CREATE POLICY opportunities_insert_auth ON opportunities FOR INSERT WITH CHECK (posted_by = auth.uid());
DROP POLICY IF EXISTS opportunities_update_own ON opportunities;
CREATE POLICY opportunities_update_own ON opportunities FOR UPDATE USING (posted_by = auth.uid()) WITH CHECK (posted_by = auth.uid());

-- Rooms
ALTER TABLE IF EXISTS zing_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zing_rooms_select_all ON zing_rooms;
CREATE POLICY zing_rooms_select_all ON zing_rooms FOR SELECT USING (true);
DROP POLICY IF EXISTS zing_rooms_insert_auth ON zing_rooms;
CREATE POLICY zing_rooms_insert_auth ON zing_rooms FOR INSERT WITH CHECK (created_by = auth.uid());

-- 7) Grant select to anon (optional) - Supabase usually manages anon role; adjust as needed
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- NOTE:
-- Run this file in your Supabase SQL editor. After running, verify the new tables exist and that the RLS policies match your security model.
