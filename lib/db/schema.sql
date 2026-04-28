-- ZYNG COMPREHENSIVE SCHEMA (PRODUCTION READY - V4 FINAL)
-- SUPABASE COMPATIBLE (PostgreSQL)

-- 1. BASE TABLES
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS faculties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(school_id, slug)
);

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID REFERENCES faculties(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(faculty_id, slug)
);

CREATE TYPE user_status AS ENUM ('regular', 'alumni');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    full_name TEXT, 
    z_name TEXT UNIQUE,
    status user_status DEFAULT 'regular',
    graduation_date DATE,
    security_question TEXT,
    security_answer_hash TEXT,
    school_id UUID REFERENCES schools(id),
    faculty_id UUID REFERENCES faculties(id),
    department_id UUID REFERENCES departments(id),
    course_of_study TEXT,
    hobbies TEXT[],
    skills TEXT[],
    bio TEXT,
    trust_score INTEGER DEFAULT 100,
    is_verified BOOLEAN DEFAULT false,
    is_held BOOLEAN DEFAULT false,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES users(id),
    onboarding_completed BOOLEAN DEFAULT false,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PERSONAS & SOCIAL
CREATE TABLE IF NOT EXISTS personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    reputation INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS zyncs (
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
);

-- 3. CONTENT (Zyngs)
CREATE TYPE post_type AS ENUM ('regular', 'confession', 'poll', 'hot_take', 'missed_connection', 'trend', 'pulse');

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
    type post_type DEFAULT 'regular',
    content TEXT NOT NULL,
    media_url TEXT,
    school_id UUID REFERENCES schools(id),
    poll_options JSONB,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES replies(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES replies(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. MESSAGING (Zing)
CREATE TABLE IF NOT EXISTS zing_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_accepted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(sender_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS zing_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    password_hash TEXT,
    created_by UUID REFERENCES users(id),
    school_id UUID REFERENCES schools(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS zing_room_members (
    room_id UUID REFERENCES zing_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS zing_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES zing_chats(id) ON DELETE CASCADE,
    room_id UUID REFERENCES zing_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PROFESSIONAL
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posted_by UUID REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    company TEXT,
    type TEXT,
    skills_required TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opportunity_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
    cover_letter TEXT,
    status TEXT DEFAULT 'submitted',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(opportunity_id, applicant_id)
);

-- 6. NOTIFICATIONS & ADMINS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id),
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE report_review_status AS ENUM ('pending', 'reviewed', 'escalated', 'resolved', 'rejected');

CREATE TABLE IF NOT EXISTS report_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status report_review_status DEFAULT 'pending',
    notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE referral_status AS ENUM ('pending', 'signed_up', 'verified', 'rewarded', 'disabled');

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    referral_code TEXT NOT NULL,
    status referral_status DEFAULT 'pending',
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(referrer_id, referral_code)
);

CREATE TYPE admin_level AS ENUM ('super', 'admin', 'sub', 'moderator');

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    level admin_level DEFAULT 'moderator',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_level admin_level,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verification_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    id_card_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

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
$$ LANGUAGE plpgsql;

-- 7. EVENT ENGINE (TRIGGERS)

CREATE OR REPLACE FUNCTION fn_trigger_notification()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    actor_name TEXT;
    actor_status TEXT;
BEGIN
    -- Get actor name
    IF TG_TABLE_NAME = 'zyncs' THEN SELECT COALESCE(z_name, full_name, 'A Zynger') INTO actor_name FROM users WHERE id = NEW.follower_id;
    ELSIF TG_TABLE_NAME = 'replies' THEN SELECT name INTO actor_name FROM personas WHERE id = NEW.persona_id;
    ELSE actor_name := 'A Zynger';
    END IF;

    -- A. USER SOCIAL
    IF TG_TABLE_NAME = 'reactions' THEN
        SELECT user_id INTO target_user_id FROM posts WHERE id = NEW.post_id;
        IF target_user_id IS NOT NULL THEN
            PERFORM fn_insert_notification(target_user_id, 'reaction', 'New Reaction', 'Someone reacted to your post.', '/z-post/' || NEW.post_id);
        END IF;
    ELSIF TG_TABLE_NAME = 'replies' THEN
        SELECT user_id INTO target_user_id FROM posts WHERE id = NEW.post_id;
        IF target_user_id IS NOT NULL THEN
            PERFORM fn_insert_notification(target_user_id, 'reply', 'New Reply', actor_name || ' replied to your Zyng.', '/z-post/' || NEW.post_id);
        END IF;
    ELSIF TG_TABLE_NAME = 'zyncs' THEN
        PERFORM fn_insert_notification(NEW.following_id, 'zync', 'New Zyncer!', actor_name || ' zynced with you.', '/z-profile');
    ELSIF TG_TABLE_NAME = 'posts' THEN
        IF TG_OP = 'INSERT' THEN
            PERFORM fn_insert_notification(NEW.user_id, 'post_created', 'Post Created', 'Your post is now live.', '/z-post/' || NEW.id);
        ELSIF TG_OP = 'UPDATE' THEN
            PERFORM fn_insert_notification(NEW.user_id, 'post_updated', 'Post Updated', 'Your post was updated.', '/z-post/' || NEW.id);
        END IF;
    ELSIF TG_TABLE_NAME = 'reports' THEN
        PERFORM fn_insert_notification(NEW.reporter_id, 'report_created', 'Report Submitted', 'Your report has been received and is pending review.', '/z-notifications');
    ELSIF TG_TABLE_NAME = 'report_reviews' THEN
        SELECT reporter_id INTO target_user_id FROM reports WHERE id = NEW.report_id;
        IF target_user_id IS NOT NULL THEN
            PERFORM fn_insert_notification(target_user_id, 'report_reviewed', 'Report Updated', 'Your report status is now ' || NEW.status || '.', '/z-notifications');
        END IF;

    -- B. ADMIN OVERSIGHT
    ELSIF TG_TABLE_NAME = 'users' THEN
        PERFORM fn_insert_notification(NEW.id, 'welcome', 'Welcome to Zyng', 'Your account has been created.', '/z-profile');
        INSERT INTO admin_notifications (target_level, type, title, message)
        VALUES ('admin', 'signup', 'New Zynger Joined', 'New account: ' || COALESCE(NEW.z_name, NEW.full_name, NEW.phone));
        INSERT INTO admin_notifications (target_level, type, title, message)
        VALUES ('super', 'signup', 'New User Signup', 'A new user has joined Zyng.');
        IF NEW.referred_by IS NOT NULL THEN
            PERFORM fn_insert_notification(NEW.referred_by, 'referral_signup', 'Your Referral Joined', 'Someone signed up with your referral code.', '/z-referral');
        END IF;
    ELSIF TG_TABLE_NAME = 'reports' THEN
        INSERT INTO admin_notifications (target_level, type, title, message)
        VALUES ('moderator', 'report', 'Content Reported', 'Reason: ' || NEW.reason);
    ELSIF TG_TABLE_NAME = 'schools' THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO admin_notifications (target_level, type, title, message)
            VALUES ('super', 'school_created', 'School Added', NEW.name || ' was added to Zyng.');
        ELSIF TG_OP = 'UPDATE' AND NEW.is_active IS DISTINCT FROM OLD.is_active THEN
            INSERT INTO admin_notifications (target_level, type, title, message)
            VALUES ('super', 'school_status', 'School Activation Changed', NEW.name || ' is now ' || CASE WHEN NEW.is_active THEN 'active' ELSE 'inactive' END || '.');
        END IF;
    ELSIF TG_TABLE_NAME = 'personas' THEN
        PERFORM fn_insert_notification(NEW.user_id, 'persona_created', 'Persona Created', 'Your persona "' || NEW.name || '" is ready.', '/z-personas');
    ELSIF TG_TABLE_NAME = 'resumes' THEN
        PERFORM fn_insert_notification(NEW.user_id, 'resume_created', 'Resume Updated', 'Your resume was created or updated.', '/z-profile');
    ELSIF TG_TABLE_NAME = 'opportunities' THEN
        PERFORM fn_insert_notification(NEW.posted_by, 'opportunity_created', 'Opportunity Posted', 'Your opportunity is now live.', '/z-jobs');
        INSERT INTO admin_notifications (target_level, type, title, message)
        VALUES ('super', 'opportunity_created', 'Opportunity Posted', COALESCE(NEW.title, 'An opportunity was posted.'));
    ELSIF TG_TABLE_NAME = 'verification_submissions' THEN
        INSERT INTO admin_notifications (target_level, type, title, message)
        VALUES ('moderator', 'verification', 'Verification Submitted', 'New verification request submitted.');
        PERFORM fn_insert_notification(NEW.user_id, 'verification_submitted', 'Verification Submitted', 'We received your verification request.', '/z-notifications');
    ELSIF TG_TABLE_NAME = 'referrals' THEN
        PERFORM fn_insert_notification(NEW.referrer_id, 'referral_created', 'Referral Code Updated', 'Your referral code activity was updated.', '/z-referral');
        IF NEW.referred_user_id IS NOT NULL THEN
            PERFORM fn_insert_notification(NEW.referred_user_id, 'referred', 'Referral Linked', 'Your account is now linked to a referrer.', '/z-profile');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_on_reaction AFTER INSERT ON reactions FOR EACH ROW EXECUTE FUNCTION fn_trigger_notification();
CREATE TRIGGER tr_on_reply AFTER INSERT ON replies FOR EACH ROW EXECUTE FUNCTION fn_trigger_notification();
CREATE TRIGGER tr_on_zync AFTER INSERT ON zyncs FOR EACH ROW EXECUTE FUNCTION fn_trigger_notification();
CREATE TRIGGER tr_on_user AFTER INSERT ON users FOR EACH ROW EXECUTE FUNCTION fn_trigger_notification();
CREATE TRIGGER tr_on_report AFTER INSERT ON reports FOR EACH ROW EXECUTE FUNCTION fn_trigger_notification();
CREATE TRIGGER tr_on_report_review AFTER INSERT OR UPDATE ON report_reviews FOR EACH ROW EXECUTE FUNCTION fn_trigger_notification();
CREATE TRIGGER tr_on_referral AFTER INSERT OR UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION fn_trigger_notification();
CREATE TRIGGER tr_on_verif AFTER INSERT ON verification_submissions FOR EACH ROW EXECUTE FUNCTION fn_trigger_notification();
CREATE TRIGGER tr_on_post AFTER INSERT OR UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION fn_trigger_notification();
CREATE TRIGGER tr_on_persona AFTER INSERT ON personas FOR EACH ROW EXECUTE FUNCTION fn_trigger_notification();
CREATE TRIGGER tr_on_school AFTER INSERT OR UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION fn_trigger_notification();
CREATE TRIGGER tr_on_resume AFTER INSERT OR UPDATE ON resumes FOR EACH ROW EXECUTE FUNCTION fn_trigger_notification();
CREATE TRIGGER tr_on_opportunity AFTER INSERT ON opportunities FOR EACH ROW EXECUTE FUNCTION fn_trigger_notification();

-- Professional Matching
CREATE OR REPLACE FUNCTION fn_match_skills()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, message, link)
    SELECT id, 'match', 'Job Match!', 'A new opportunity matches your skills.', '/z-pro'
    FROM users WHERE skills && NEW.skills_required;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_on_job AFTER INSERT ON opportunities FOR EACH ROW EXECUTE FUNCTION fn_match_skills();


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


-- zyng_referral_and_rls.sql
-- 1. Function to auto-generate referral code starting with 'Z' and unique
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
BEGIN
  LOOP
    new_code := 'Z' || substr(md5(random()::text), 1, 7);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM users WHERE referral_code = new_code);
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger to set referral_code on insert if not provided
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_referral_code ON users;
CREATE TRIGGER trg_set_referral_code
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION set_referral_code();

-- 3. RLS: Enable and add read policies for all relevant tables
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Allow read for all (adjust as needed for production)
CREATE POLICY users_read_all ON users FOR SELECT USING (true);
CREATE POLICY schools_read_all ON schools FOR SELECT USING (true);
CREATE POLICY faculties_read_all ON faculties FOR SELECT USING (true);
CREATE POLICY departments_read_all ON departments FOR SELECT USING (true);
CREATE POLICY personas_read_all ON personas FOR SELECT USING (true);
CREATE POLICY posts_read_all ON posts FOR SELECT USING (true);
CREATE POLICY replies_read_all ON replies FOR SELECT USING (true);
CREATE POLICY reactions_read_all ON reactions FOR SELECT USING (true);
