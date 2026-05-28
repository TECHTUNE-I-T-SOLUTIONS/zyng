-- Admin roles and support-desk permissions.
-- Safe to run in Supabase SQL editor. Policies compare admin_level as text so
-- the newly-added "support" enum value is not used unsafely before commit.

alter type public.admin_level add value if not exists 'support';

alter table public.admins
  add column if not exists is_active boolean not null default true,
  add column if not exists full_name text,
  add column if not exists last_login timestamptz,
  add column if not exists updated_at timestamptz default now();

create index if not exists admins_level_active_idx on public.admins (level, is_active);
create index if not exists admins_user_id_idx on public.admins (user_id);

alter table public.admin_notifications enable row level security;

drop policy if exists "Admins can read admin notifications" on public.admin_notifications;
create policy "Admins can read admin notifications"
on public.admin_notifications
for select
to authenticated
using (
  exists (
    select 1 from public.admins
    where admins.user_id = auth.uid()
      and admins.is_active = true
      and (
        admins.level::text in ('super', 'admin')
        or admins.level = admin_notifications.target_level
        or admins.level::text in ('moderator', 'support')
      )
  )
);

drop policy if exists "Admins can update admin notifications" on public.admin_notifications;
create policy "Admins can update admin notifications"
on public.admin_notifications
for update
to authenticated
using (
  exists (
    select 1 from public.admins
    where admins.user_id = auth.uid()
      and admins.is_active = true
  )
)
with check (
  exists (
    select 1 from public.admins
    where admins.user_id = auth.uid()
      and admins.is_active = true
  )
);

drop policy if exists "Support admins can read contact submissions" on public.contact_submissions;
create policy "Support admins can read contact submissions"
on public.contact_submissions
for select
to authenticated
using (
  exists (
    select 1 from public.admins
    where admins.user_id = auth.uid()
      and admins.is_active = true
      and admins.level::text in ('super', 'admin', 'sub', 'support')
  )
);

drop policy if exists "Support admins can update contact submissions" on public.contact_submissions;
create policy "Support admins can update contact submissions"
on public.contact_submissions
for update
to authenticated
using (
  exists (
    select 1 from public.admins
    where admins.user_id = auth.uid()
      and admins.is_active = true
      and admins.level::text in ('super', 'admin', 'sub', 'support')
  )
)
with check (
  exists (
    select 1 from public.admins
    where admins.user_id = auth.uid()
      and admins.is_active = true
      and admins.level::text in ('super', 'admin', 'sub', 'support')
  )
);

drop policy if exists "Support admins can read feedback submissions" on public.feedback_submissions;
create policy "Support admins can read feedback submissions"
on public.feedback_submissions
for select
to authenticated
using (
  exists (
    select 1 from public.admins
    where admins.user_id = auth.uid()
      and admins.is_active = true
      and admins.level::text in ('super', 'admin', 'sub', 'support')
  )
);

drop policy if exists "Support admins can update feedback submissions" on public.feedback_submissions;
create policy "Support admins can update feedback submissions"
on public.feedback_submissions
for update
to authenticated
using (
  exists (
    select 1 from public.admins
    where admins.user_id = auth.uid()
      and admins.is_active = true
      and admins.level::text in ('super', 'admin', 'sub', 'support')
  )
)
with check (
  exists (
    select 1 from public.admins
    where admins.user_id = auth.uid()
      and admins.is_active = true
      and admins.level in ('super', 'admin', 'sub', 'support')
  )
);
