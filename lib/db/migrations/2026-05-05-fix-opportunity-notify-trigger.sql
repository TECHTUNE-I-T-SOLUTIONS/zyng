-- Migration: Replace fn_notify_opportunity_matches to avoid RLS violations when inserting into admin_notifications
-- Run this as a privileged user (Supabase SQL editor / service role) so SECURITY DEFINER functions are owned by a superuser.

BEGIN;

-- Helper: admin insert via SECURITY DEFINER
CREATE OR REPLACE FUNCTION fn_admin_insert_notification(p_target_level admin_level, p_type TEXT, p_title TEXT, p_message TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO admin_notifications (target_level, type, title, message)
  VALUES (p_target_level, p_type, p_title, p_message);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: After creating this function, set its owner to a privileged role if needed, e.g.:
-- ALTER FUNCTION fn_admin_insert_notification(TEXT, TEXT, TEXT, TEXT) OWNER TO postgres;
-- (Run the ALTER as a DB owner.)

-- Recreate the notify function to use the SECURITY DEFINER helper for admin notifications
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
    PERFORM fn_insert_notification(matched.id, 'opportunity_match', 'Opportunity: ' || NEW.title, 'A new opportunity matches your skills: ' || COALESCE(NEW.title, ''), '/z-jobs/' || NEW.id);
  END LOOP;

  -- Use SECURITY DEFINER helper to insert admin notification to avoid RLS issues
  PERFORM fn_admin_insert_notification('moderator'::admin_level, 'opportunity_created', 'Opportunity Posted', 'Opportunity "' || COALESCE(NEW.title, '') || '" was posted.');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS tr_on_opportunity ON opportunities;
CREATE TRIGGER tr_on_opportunity AFTER INSERT ON opportunities FOR EACH ROW EXECUTE FUNCTION fn_notify_opportunity_matches();

COMMIT;
