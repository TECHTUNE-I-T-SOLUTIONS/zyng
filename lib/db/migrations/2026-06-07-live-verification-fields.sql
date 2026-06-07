alter table public.verification_submissions
  add column if not exists video_url text,
  add column if not exists challenge_phrase text,
  add column if not exists profile_snapshot jsonb,
  add column if not exists reviewed_at timestamptz,
  add column if not exists document_deleted_at timestamptz;
