-- Run this in Supabase to fix portfolio and resume save failures caused by admin_notifications RLS.
-- It keeps the trigger-based notification flow, but runs the trigger functions as the definer
-- so regular app saves do not need direct write access to admin_notifications.

create or replace function public.fn_notify_portfolio_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.notifications (user_id, type, title, message, link)
    values (new.user_id, 'portfolio_created', 'Portfolio Created', 'Your professional portfolio has been created.', '/z-pro/portfolio/' || new.id);

    insert into public.admin_notifications (target_level, type, title, message)
    values ('moderator', 'portfolio_created', 'Portfolio Created', 'User ' || coalesce(new.user_id::text, '') || ' created their portfolio.');

  elsif (tg_op = 'UPDATE') then
    insert into public.notifications (user_id, type, title, message, link)
    values (new.user_id, 'portfolio_updated', 'Portfolio Updated', 'Your professional portfolio was updated.', '/z-pro/portfolio/' || new.id);

    insert into public.admin_notifications (target_level, type, title, message)
    values ('moderator', 'portfolio_updated', 'Portfolio Updated', 'User ' || coalesce(new.user_id::text, '') || ' updated their portfolio.');
  end if;

  return new;
end;
$$;

alter function public.fn_notify_portfolio_change() security definer;
alter function public.fn_notify_portfolio_change() set search_path = public;

alter function public.fn_trigger_notification() security definer;
alter function public.fn_trigger_notification() set search_path = public;

-- Recreate the trigger to use the hardened function definition.
drop trigger if exists tr_on_portfolios_change on public.portfolios;
create trigger tr_on_portfolios_change
after insert or update on public.portfolios
for each row
execute function public.fn_notify_portfolio_change();

-- Optional: keep these policies tight for direct app access.
alter table if exists public.portfolios enable row level security;
drop policy if exists portfolios_select_owner on public.portfolios;
create policy portfolios_select_owner on public.portfolios
for select using (user_id = auth.uid());
drop policy if exists portfolios_insert_owner on public.portfolios;
create policy portfolios_insert_owner on public.portfolios
for insert with check (user_id = auth.uid());
drop policy if exists portfolios_update_owner on public.portfolios;
create policy portfolios_update_owner on public.portfolios
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table if exists public.resumes enable row level security;
drop policy if exists resumes_select_owner on public.resumes;
create policy resumes_select_owner on public.resumes
for select using (user_id = auth.uid());
drop policy if exists resumes_insert_owner on public.resumes;
create policy resumes_insert_owner on public.resumes
for insert with check (user_id = auth.uid());
drop policy if exists resumes_update_owner on public.resumes;
create policy resumes_update_owner on public.resumes
for update using (user_id = auth.uid()) with check (user_id = auth.uid());
