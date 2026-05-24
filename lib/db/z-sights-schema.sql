-- Schema updates for Z-Sights (Project Showcases) and missing RLS policies

-- 1) RLS Policies for zing_messages (fix for 403 Forbidden)
ALTER TABLE IF EXISTS zing_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS zing_messages_select_all ON zing_messages;
CREATE POLICY zing_messages_select_all ON zing_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS zing_messages_insert_auth ON zing_messages;
CREATE POLICY zing_messages_insert_auth ON zing_messages FOR INSERT WITH CHECK (sender_id = auth.uid());


-- 2) Tables for Z-Sights (zync_projects, zync_updates, zync_comments, zync_reactions)
CREATE TABLE IF NOT EXISTS zync_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    link TEXT,
    images TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS zync_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zync_id UUID REFERENCES zync_projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS zync_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zync_id UUID REFERENCES zync_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS zync_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zync_id UUID REFERENCES zync_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for Z-Sights tables
ALTER TABLE IF EXISTS zync_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zync_projects_select_all ON zync_projects;
CREATE POLICY zync_projects_select_all ON zync_projects FOR SELECT USING (true);
DROP POLICY IF EXISTS zync_projects_insert_auth ON zync_projects;
CREATE POLICY zync_projects_insert_auth ON zync_projects FOR INSERT WITH CHECK (user_id = auth.uid());

ALTER TABLE IF EXISTS zync_updates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zync_updates_select_all ON zync_updates;
CREATE POLICY zync_updates_select_all ON zync_updates FOR SELECT USING (true);
DROP POLICY IF EXISTS zync_updates_insert_auth ON zync_updates;
CREATE POLICY zync_updates_insert_auth ON zync_updates FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM zync_projects WHERE id = zync_id AND user_id = auth.uid())
);

ALTER TABLE IF EXISTS zync_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zync_comments_select_all ON zync_comments;
CREATE POLICY zync_comments_select_all ON zync_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS zync_comments_insert_auth ON zync_comments;
CREATE POLICY zync_comments_insert_auth ON zync_comments FOR INSERT WITH CHECK (user_id = auth.uid());

ALTER TABLE IF EXISTS zync_reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS zync_reactions_select_all ON zync_reactions;
CREATE POLICY zync_reactions_select_all ON zync_reactions FOR SELECT USING (true);
DROP POLICY IF EXISTS zync_reactions_insert_auth ON zync_reactions;
CREATE POLICY zync_reactions_insert_auth ON zync_reactions FOR INSERT WITH CHECK (user_id = auth.uid());

-- Triggers for Notifications on Z-Sights
CREATE OR REPLACE FUNCTION fn_trigger_zync_notification()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    actor_name TEXT;
BEGIN
    SELECT COALESCE(z_name, full_name, 'A Zynger') INTO actor_name FROM users WHERE id = NEW.user_id;

    IF TG_TABLE_NAME = 'zync_comments' THEN
        SELECT user_id INTO target_user_id FROM zync_projects WHERE id = NEW.zync_id;
        IF target_user_id IS NOT NULL AND target_user_id <> NEW.user_id THEN
            INSERT INTO notifications (user_id, type, title, message, link)
            VALUES (target_user_id, 'zync_comment', 'New Comment on Zync', actor_name || ' commented on your Zync project.', '/z-sights/' || NEW.zync_id);
        END IF;
    ELSIF TG_TABLE_NAME = 'zync_reactions' THEN
        SELECT user_id INTO target_user_id FROM zync_projects WHERE id = NEW.zync_id;
        IF target_user_id IS NOT NULL AND target_user_id <> NEW.user_id THEN
            INSERT INTO notifications (user_id, type, title, message, link)
            VALUES (target_user_id, 'zync_reaction', 'New Reaction on Zync', actor_name || ' reacted to your Zync project.', '/z-sights/' || NEW.zync_id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_on_zync_comment ON zync_comments;
CREATE TRIGGER tr_on_zync_comment AFTER INSERT ON zync_comments FOR EACH ROW EXECUTE FUNCTION fn_trigger_zync_notification();

DROP TRIGGER IF EXISTS tr_on_zync_reaction ON zync_reactions;
CREATE TRIGGER tr_on_zync_reaction AFTER INSERT ON zync_reactions FOR EACH ROW EXECUTE FUNCTION fn_trigger_zync_notification();
