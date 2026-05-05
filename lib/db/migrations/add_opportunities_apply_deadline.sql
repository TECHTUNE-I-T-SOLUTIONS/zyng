-- Migration: add apply_deadline and ensure skills_required exists
-- Adds `apply_deadline` (timestamp with time zone) to `public.opportunities` and ensures `skills_required` is a text[] column.

BEGIN;

ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS apply_deadline timestamptz NULL;

ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS skills_required text[] NULL;

COMMIT;

-- Optional index to help queries for active opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_apply_deadline ON public.opportunities (apply_deadline);
