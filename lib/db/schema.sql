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
    media_urls JSONB DEFAULT '[]'::jsonb,
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














-- FROM SUPABASE
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  target_level USER-DEFINED,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_resolved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_notifications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.admins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  level USER-DEFINED DEFAULT 'moderator'::admin_level,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admins_pkey PRIMARY KEY (id),
  CONSTRAINT admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  faculty_id uuid,
  school_id uuid,
  name text NOT NULL,
  slug text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT departments_pkey PRIMARY KEY (id),
  CONSTRAINT departments_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id),
  CONSTRAINT departments_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.faculties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  school_id uuid,
  name text NOT NULL,
  slug text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT faculties_pkey PRIMARY KEY (id),
  CONSTRAINT faculties_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.maintenance_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  maintenance_id uuid,
  admin_id uuid,
  action text NOT NULL,
  previous_state jsonb,
  new_state jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT maintenance_audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT maintenance_audit_logs_maintenance_id_fkey FOREIGN KEY (maintenance_id) REFERENCES public.maintenance_settings(id),
  CONSTRAINT maintenance_audit_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id)
);
CREATE TABLE public.maintenance_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  is_enabled boolean NOT NULL DEFAULT false,
  title text NOT NULL DEFAULT 'Maintenance in Progress'::text,
  message text NOT NULL DEFAULT 'We are making improvements to Zyng. You may experience brief interruptions while updates are being applied.'::text,
  updated_by uuid,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT maintenance_settings_pkey PRIMARY KEY (id),
  CONSTRAINT maintenance_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.admins(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.opportunities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  posted_by uuid,
  title text NOT NULL,
  description text NOT NULL,
  company text,
  type text,
  skills_required ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  attachments jsonb DEFAULT '[]'::jsonb,
  location text,
  compensation text CHECK (char_length(COALESCE(compensation, ''::text)) <= 200),
  apply_deadline timestamp with time zone,
  school_id uuid,
  external_url text,
  accepts_applications boolean DEFAULT true,
  application_instructions text,
  CONSTRAINT opportunities_pkey PRIMARY KEY (id),
  CONSTRAINT opportunities_posted_by_fkey FOREIGN KEY (posted_by) REFERENCES public.users(id),
  CONSTRAINT opportunities_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.opportunity_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  opportunity_id uuid,
  applicant_id uuid,
  resume_id uuid,
  resume_url text,
  cover_letter text,
  status text DEFAULT 'submitted'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT opportunity_applications_pkey PRIMARY KEY (id),
  CONSTRAINT opportunity_applications_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id),
  CONSTRAINT opportunity_applications_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.users(id),
  CONSTRAINT opportunity_applications_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.resumes(id)
);
CREATE TABLE public.personas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  avatar_url text,
  reputation integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT personas_pkey PRIMARY KEY (id),
  CONSTRAINT personas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.portfolios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title text,
  summary text,
  skills ARRAY,
  entries jsonb DEFAULT '[]'::jsonb,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT portfolios_pkey PRIMARY KEY (id),
  CONSTRAINT portfolios_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  persona_id uuid,
  type USER-DEFINED DEFAULT 'regular'::post_type,
  content text NOT NULL,
  media_url text,
  school_id uuid,
  poll_options jsonb,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  media_urls jsonb DEFAULT '[]'::jsonb,
  hashtags jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT posts_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.personas(id),
  CONSTRAINT posts_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  post_id uuid,
  reply_id uuid,
  type text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reactions_pkey PRIMARY KEY (id),
  CONSTRAINT reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT reactions_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT reactions_reply_id_fkey FOREIGN KEY (reply_id) REFERENCES public.replies(id)
);
CREATE TABLE public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  referrer_id uuid,
  referred_user_id uuid,
  referral_code text NOT NULL,
  status USER-DEFINED DEFAULT 'pending'::referral_status,
  source text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT referrals_pkey PRIMARY KEY (id),
  CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.users(id),
  CONSTRAINT referrals_referred_user_id_fkey FOREIGN KEY (referred_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.replies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  persona_id uuid,
  parent_reply_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT replies_pkey PRIMARY KEY (id),
  CONSTRAINT replies_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT replies_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.personas(id),
  CONSTRAINT replies_parent_reply_id_fkey FOREIGN KEY (parent_reply_id) REFERENCES public.replies(id)
);
CREATE TABLE public.report_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid,
  reviewer_id uuid,
  status USER-DEFINED DEFAULT 'pending'::report_review_status,
  notes text,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT report_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT report_reviews_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id),
  CONSTRAINT report_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id)
);
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reporter_id uuid,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id)
);
CREATE TABLE public.resumes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  content jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT resumes_pkey PRIMARY KEY (id),
  CONSTRAINT resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.schools (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  logo_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT schools_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  email text UNIQUE,
  full_name text,
  z_name text UNIQUE,
  status USER-DEFINED DEFAULT 'regular'::user_status,
  graduation_date date,
  security_question text,
  security_answer_hash text,
  school_id uuid,
  faculty_id uuid,
  department_id uuid,
  course_of_study text,
  hobbies ARRAY,
  skills ARRAY,
  bio text,
  trust_score integer DEFAULT 100,
  is_verified boolean DEFAULT false,
  is_held boolean DEFAULT false,
  referral_code text UNIQUE,
  referred_by uuid,
  onboarding_completed boolean DEFAULT false,
  last_login timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  avatar_url text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
  CONSTRAINT users_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id),
  CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT users_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES public.users(id)
);
CREATE TABLE public.verification_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  id_card_url text NOT NULL,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT verification_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT verification_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.zing_chats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid,
  receiver_id uuid,
  is_accepted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT zing_chats_pkey PRIMARY KEY (id),
  CONSTRAINT zing_chats_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id),
  CONSTRAINT zing_chats_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id)
);
CREATE TABLE public.zing_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  location text,
  is_virtual boolean DEFAULT false,
  created_by uuid,
  school_id uuid,
  cover_image text,
  tags ARRAY,
  category text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  images ARRAY,
  CONSTRAINT zing_events_pkey PRIMARY KEY (id),
  CONSTRAINT zing_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT zing_events_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.zing_marketplace (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric,
  currency text DEFAULT 'NGN'::text,
  is_sold boolean DEFAULT false,
  media_url text,
  images ARRAY,
  created_by uuid,
  school_id uuid,
  category text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT zing_marketplace_pkey PRIMARY KEY (id),
  CONSTRAINT zing_marketplace_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT zing_marketplace_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.zing_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chat_id uuid,
  room_id uuid,
  sender_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT zing_messages_pkey PRIMARY KEY (id),
  CONSTRAINT zing_messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.zing_chats(id),
  CONSTRAINT zing_messages_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.zing_rooms(id),
  CONSTRAINT zing_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id)
);
CREATE TABLE public.zing_room_members (
  room_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text DEFAULT 'member'::text,
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT zing_room_members_pkey PRIMARY KEY (room_id, user_id),
  CONSTRAINT zing_room_members_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.zing_rooms(id),
  CONSTRAINT zing_room_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.zing_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_private boolean DEFAULT false,
  password_hash text,
  created_by uuid,
  school_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT zing_rooms_pkey PRIMARY KEY (id),
  CONSTRAINT zing_rooms_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT zing_rooms_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.zyncs (
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT zyncs_pkey PRIMARY KEY (follower_id, following_id),
  CONSTRAINT zyncs_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id),
  CONSTRAINT zyncs_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id)
);