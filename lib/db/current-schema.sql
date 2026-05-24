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
CREATE TABLE public.zync_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  zync_id uuid,
  user_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT zync_comments_pkey PRIMARY KEY (id),
  CONSTRAINT zync_comments_zync_id_fkey FOREIGN KEY (zync_id) REFERENCES public.zync_projects(id),
  CONSTRAINT zync_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.zync_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL,
  description text,
  category text,
  link text,
  images ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT zync_projects_pkey PRIMARY KEY (id),
  CONSTRAINT zync_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.zync_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  zync_id uuid,
  user_id uuid,
  type text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT zync_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT zync_reactions_zync_id_fkey FOREIGN KEY (zync_id) REFERENCES public.zync_projects(id),
  CONSTRAINT zync_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.zync_updates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  zync_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT zync_updates_pkey PRIMARY KEY (id),
  CONSTRAINT zync_updates_zync_id_fkey FOREIGN KEY (zync_id) REFERENCES public.zync_projects(id)
);
CREATE TABLE public.zyncs (
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT zyncs_pkey PRIMARY KEY (follower_id, following_id),
  CONSTRAINT zyncs_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id),
  CONSTRAINT zyncs_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id)
);