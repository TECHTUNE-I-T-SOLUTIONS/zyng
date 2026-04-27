-- ZYNG MAINTENANCE MODE TABLES
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS maintenance_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    title TEXT NOT NULL DEFAULT 'Maintenance in Progress',
    message TEXT NOT NULL DEFAULT 'We are making improvements to Zyng. You may experience brief interruptions while updates are being applied.',
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_id UUID REFERENCES maintenance_settings(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO maintenance_settings (is_enabled, title, message)
SELECT false, 'Maintenance in Progress', 'We are making improvements to Zyng. You may experience brief interruptions while updates are being applied.'
WHERE NOT EXISTS (SELECT 1 FROM maintenance_settings);

CREATE OR REPLACE FUNCTION fn_touch_maintenance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_touch_maintenance_updated_at ON maintenance_settings;
CREATE TRIGGER tr_touch_maintenance_updated_at
BEFORE UPDATE ON maintenance_settings
FOR EACH ROW EXECUTE FUNCTION fn_touch_maintenance_updated_at();

CREATE OR REPLACE FUNCTION fn_broadcast_maintenance_notifications()
RETURNS TRIGGER AS $$
DECLARE
    notice_title TEXT;
    notice_message TEXT;
BEGIN
    IF NEW.is_enabled IS DISTINCT FROM OLD.is_enabled THEN
        IF NEW.is_enabled THEN
            notice_title := COALESCE(NEW.title, 'Maintenance in Progress');
            notice_message := COALESCE(NEW.message, 'We are making improvements to Zyng. Please bear with us while we apply updates and polish the experience.');

            INSERT INTO notifications (user_id, type, title, message, link)
            SELECT id, 'maintenance_on', notice_title, notice_message, '/z-notifications'
            FROM users;

            INSERT INTO admin_notifications (target_level, type, title, message)
            VALUES
                ('super', 'maintenance_on', notice_title, notice_message),
                ('admin', 'maintenance_on', notice_title, notice_message),
                ('sub', 'maintenance_on', notice_title, notice_message),
                ('moderator', 'maintenance_on', notice_title, notice_message);
        ELSE
            notice_title := COALESCE(NEW.title, 'Maintenance Complete');
            notice_message := 'Maintenance has ended. Thank you for bearing with us. Look forward to the new features and improvements now live on Zyng.';

            INSERT INTO notifications (user_id, type, title, message, link)
            SELECT id, 'maintenance_off', notice_title, notice_message, '/z-notifications'
            FROM users;

            INSERT INTO admin_notifications (target_level, type, title, message)
            VALUES
                ('super', 'maintenance_off', notice_title, notice_message),
                ('admin', 'maintenance_off', notice_title, notice_message),
                ('sub', 'maintenance_off', notice_title, notice_message),
                ('moderator', 'maintenance_off', notice_title, notice_message);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_broadcast_maintenance_notifications ON maintenance_settings;
CREATE TRIGGER tr_broadcast_maintenance_notifications
AFTER UPDATE ON maintenance_settings
FOR EACH ROW EXECUTE FUNCTION fn_broadcast_maintenance_notifications();
