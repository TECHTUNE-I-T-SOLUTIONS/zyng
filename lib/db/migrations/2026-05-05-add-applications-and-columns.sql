-- Migration: Add external link support, accepts_applications flag, application_instructions to opportunities
-- and create opportunity_applications table plus notification triggers
-- Run in Supabase SQL editor as DB owner / service role

BEGIN;

-- 1) Add columns to opportunities
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS external_url TEXT,
  ADD COLUMN IF NOT EXISTS accepts_applications BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS application_instructions TEXT;

CREATE INDEX IF NOT EXISTS idx_opportunities_external_url ON public.opportunities USING btree (external_url);

-- 2) Create or alter opportunity_applications table
-- If table doesn't exist, create fully; if it exists, add missing columns

-- Create table if not exists (safe to run repeatedly)
CREATE TABLE IF NOT EXISTS public.opportunity_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(opportunity_id, applicant_id)
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_applications_opportunity ON public.opportunity_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON public.opportunity_applications(applicant_id);

-- If the table already existed but lacked 'resume_url' or 'updated_at', add them
ALTER TABLE public.opportunity_applications
  ADD COLUMN IF NOT EXISTS resume_url TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3) Notification trigger: notify opportunity poster when a new application is submitted
CREATE OR REPLACE FUNCTION fn_notify_new_application()
RETURNS TRIGGER AS $$
DECLARE
  opp_owner UUID;
  opp_title TEXT;
BEGIN
  SELECT posted_by, title INTO opp_owner, opp_title FROM public.opportunities WHERE id = NEW.opportunity_id;

  IF opp_owner IS NOT NULL THEN
    PERFORM fn_insert_notification(opp_owner, 'application_received', 'New application', 'A new application was submitted for "' || COALESCE(opp_title,'') || '"', '/z-jobs/' || NEW.opportunity_id || '/applications');
  END IF;

  -- admin notification (use SECURITY DEFINER helper if present)
  BEGIN
    PERFORM fn_admin_insert_notification('moderator'::admin_level, 'application_submitted', 'Application Submitted', 'A new application was submitted for "' || COALESCE(opp_title,'') || '"');
  EXCEPTION WHEN undefined_function THEN
    -- fn_admin_insert_notification not present; skip admin notification
    NULL;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_on_new_application ON public.opportunity_applications;
CREATE TRIGGER tr_on_new_application
AFTER INSERT ON public.opportunity_applications
FOR EACH ROW
EXECUTE FUNCTION fn_notify_new_application();

-- 4) Notification trigger: notify applicant when application status changes
CREATE OR REPLACE FUNCTION fn_notify_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
  opp_title TEXT;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT title INTO opp_title FROM public.opportunities WHERE id = NEW.opportunity_id;
    PERFORM fn_insert_notification(NEW.applicant_id, 'application_update', 'Application ' || NEW.status, 'Your application status is now "' || COALESCE(NEW.status,'') || '" for "' || COALESCE(opp_title,'') || '"', '/z-jobs/' || NEW.opportunity_id || '/applications');

    -- admin notification for status changes (optional)
    BEGIN
      PERFORM fn_admin_insert_notification('moderator'::admin_level, 'application_status_change', 'Application Status Changed', 'Application ' || COALESCE(NEW.status,'') || ' for "' || COALESCE(opp_title,'') || '"');
    EXCEPTION WHEN undefined_function THEN
      NULL;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_on_application_status_change ON public.opportunity_applications;
CREATE TRIGGER tr_on_application_status_change
AFTER UPDATE OF status ON public.opportunity_applications
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION fn_notify_application_status_change();

COMMIT;
