-- Migration: add missing columns used by the create-job form
-- Adds `location` and `compensation` to `public.opportunities` if they do not exist.

BEGIN;

ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS location text NULL,
  ADD COLUMN IF NOT EXISTS compensation text NULL;

-- ensure attachments column exists (should already exist per previous schema)
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS attachments jsonb NULL DEFAULT '[]'::jsonb;

COMMIT;

-- Optional: create an index to help queries filtering by location
CREATE INDEX IF NOT EXISTS idx_opportunities_location ON public.opportunities (lower(coalesce(location, '')));

-- Optional: add a simple check constraint on compensation length
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public' AND tc.table_name = 'opportunities' AND tc.constraint_name = 'opportunities_compensation_len_ck'
  ) THEN
    BEGIN
      ALTER TABLE public.opportunities
        ADD CONSTRAINT opportunities_compensation_len_ck CHECK (char_length(coalesce(compensation, '')) <= 200);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END$$;
