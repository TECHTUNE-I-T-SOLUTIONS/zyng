-- Contact and feedback submissions for public Zyng pages.
-- Run this in Supabase SQL editor or your migration pipeline.

create extension if not exists pgcrypto;

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  topic text not null,
  message text not null,
  name text,
  school_name text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'resolved', 'closed', 'spam')),
  source text not null default 'contact_page',
  user_agent text,
  ip_address text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  mood integer check (mood between 1 and 5),
  category text not null default 'general',
  message text not null,
  school_name text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'planned', 'resolved', 'closed', 'spam')),
  source text not null default 'feedback_page',
  user_agent text,
  ip_address text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_submissions_status_created_idx
  on public.contact_submissions (status, created_at desc);

create index if not exists contact_submissions_topic_created_idx
  on public.contact_submissions (topic, created_at desc);

create index if not exists feedback_submissions_status_created_idx
  on public.feedback_submissions (status, created_at desc);

create index if not exists feedback_submissions_category_created_idx
  on public.feedback_submissions (category, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_contact_submissions_updated_at on public.contact_submissions;
create trigger set_contact_submissions_updated_at
before update on public.contact_submissions
for each row execute function public.set_updated_at();

drop trigger if exists set_feedback_submissions_updated_at on public.feedback_submissions;
create trigger set_feedback_submissions_updated_at
before update on public.feedback_submissions
for each row execute function public.set_updated_at();

alter table public.contact_submissions enable row level security;
alter table public.feedback_submissions enable row level security;

drop policy if exists "Public can create contact submissions" on public.contact_submissions;
create policy "Public can create contact submissions"
on public.contact_submissions
for insert
to anon, authenticated
with check (
  length(trim(email)) > 3
  and position('@' in email) > 1
  and length(trim(topic)) > 0
  and length(trim(message)) >= 10
);

drop policy if exists "Admins can manage contact submissions" on public.contact_submissions;
create policy "Admins can manage contact submissions"
on public.contact_submissions
for all
to authenticated
using (
  exists (
    select 1 from public.admins
    where admins.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.admins
    where admins.user_id = auth.uid()
  )
);

drop policy if exists "Public can create feedback submissions" on public.feedback_submissions;
create policy "Public can create feedback submissions"
on public.feedback_submissions
for insert
to anon, authenticated
with check (
  length(trim(message)) >= 10
  and (email is null or email = '' or position('@' in email) > 1)
  and mood between 1 and 5
);

drop policy if exists "Admins can manage feedback submissions" on public.feedback_submissions;
create policy "Admins can manage feedback submissions"
on public.feedback_submissions
for all
to authenticated
using (
  exists (
    select 1 from public.admins
    where admins.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.admins
    where admins.user_id = auth.uid()
  )
);

create or replace function public.notify_admins_contact_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_notifications (target_level, type, title, message)
  values
    (
      'admin'::admin_level,
      'contact_submission',
      'New Contact Request',
      'Topic: ' || coalesce(new.topic, 'General') || '. From: ' || coalesce(nullif(new.email, ''), 'No email') || '.'
    ),
    (
      'moderator'::admin_level,
      'contact_submission',
      'New Contact Request',
      'Topic: ' || coalesce(new.topic, 'General') || '. From: ' || coalesce(nullif(new.email, ''), 'No email') || '.'
    );

  if lower(coalesce(new.topic, '')) like '%partnership%'
    or lower(coalesce(new.topic, '')) like '%school%'
    or lower(coalesce(new.topic, '')) like '%faculty%'
    or lower(coalesce(new.topic, '')) like '%department%' then
    insert into public.admin_notifications (target_level, type, title, message)
    values (
      'super'::admin_level,
      'school_contact_submission',
      'School or Partnership Request',
      'A public contact submission needs school or partnership review. Topic: ' || coalesce(new.topic, 'General') || '.'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists notify_admins_on_contact_submission on public.contact_submissions;
create trigger notify_admins_on_contact_submission
after insert on public.contact_submissions
for each row execute function public.notify_admins_contact_submission();

create or replace function public.notify_admins_feedback_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_notifications (target_level, type, title, message)
  values
    (
      'admin'::admin_level,
      'feedback_submission',
      'New Feedback Submitted',
      'Category: ' || coalesce(new.category, 'general') || coalesce('. Mood: ' || new.mood::text, '') || '.'
    ),
    (
      'moderator'::admin_level,
      'feedback_submission',
      'New Feedback Submitted',
      'Category: ' || coalesce(new.category, 'general') || coalesce('. Mood: ' || new.mood::text, '') || '.'
    );

  if lower(coalesce(new.category, '')) in ('school', 'safety', 'partnership') then
    insert into public.admin_notifications (target_level, type, title, message)
    values (
      'super'::admin_level,
      'priority_feedback_submission',
      'Priority Feedback Submitted',
      'A public feedback submission was marked as ' || coalesce(new.category, 'priority') || '.'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists notify_admins_on_feedback_submission on public.feedback_submissions;
create trigger notify_admins_on_feedback_submission
after insert on public.feedback_submissions
for each row execute function public.notify_admins_feedback_submission();
