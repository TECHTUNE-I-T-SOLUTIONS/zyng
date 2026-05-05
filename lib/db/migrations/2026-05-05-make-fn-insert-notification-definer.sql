-- Migration: Make fn_insert_notification SECURITY DEFINER so triggers can insert user notifications without RLS violations
-- Run this as a DB owner (Supabase SQL editor / service role)

BEGIN;

-- Replace fn_insert_notification with SECURITY DEFINER version
CREATE OR REPLACE FUNCTION fn_insert_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_link TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (p_user_id, p_type, p_title, p_message, p_link);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optionally change owner to a privileged role (run as DB owner):
-- ALTER FUNCTION fn_insert_notification(UUID, TEXT, TEXT, TEXT, TEXT) OWNER TO postgres;

COMMIT;
