-- Run this in Supabase to fix event posting failures caused by admin_notifications RLS.
-- It hardens the event notification trigger functions so inserts into admin_notifications
-- happen with definer privileges instead of the browser user's RLS context.

create or replace function public.fn_notify_event_matches()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  matched record;
begin
  if coalesce(new.tags, array[]::text[]) = array[]::text[] then
    return new;
  end if;

  for matched in
    select distinct u.id
    from public.users u
    where u.id is not null
      and u.id <> new.created_by
      and (u.school_id is null or u.school_id = new.school_id)
      and (
        coalesce(u.skills, array[]::text[]) && coalesce(new.tags, array[]::text[])
        or coalesce(u.hobbies, array[]::text[]) && coalesce(new.tags, array[]::text[])
      )
  loop
    insert into public.notifications (user_id, type, title, message, link)
    values (matched.id, 'event_relevant', 'Event: ' || new.title, 'An event matching your interests is happening: ' || coalesce(new.title, ''), '/z-events/' || new.id);
  end loop;

  insert into public.admin_notifications (target_level, type, title, message)
  values (
    'moderator',
    'event_created',
    'Event Created',
    'Event "' || coalesce(new.title, '') || '" was created.'
  );

  return new;
end;
$$;

alter function public.fn_notify_event_matches() security definer;
alter function public.fn_notify_event_matches() set search_path = public;

create or replace function public.fn_notify_opportunity_matches()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  matched record;
begin
  if coalesce(new.skills_required, array[]::text[]) = array[]::text[] then
    return new;
  end if;

  for matched in
    select distinct u.id
    from public.users u
    where u.id is not null
      and u.id <> new.posted_by
      and (u.school_id is null or u.school_id = new.school_id)
      and (
        coalesce(u.skills, array[]::text[]) && coalesce(new.skills_required, array[]::text[])
        or coalesce(u.hobbies, array[]::text[]) && coalesce(new.skills_required, array[]::text[])
      )
  loop
    insert into public.notifications (user_id, type, title, message, link)
    values (matched.id, 'opportunity_match', 'Opportunity: ' || new.title, 'A new opportunity matches your skills: ' || coalesce(new.title, ''), '/z-jobs/' || new.id);
  end loop;

  insert into public.admin_notifications (target_level, type, title, message)
  values (
    'moderator',
    'opportunity_created',
    'Opportunity Posted',
    'Opportunity "' || coalesce(new.title, '') || '" was posted.'
  );

  return new;
end;
$$;

alter function public.fn_notify_opportunity_matches() security definer;
alter function public.fn_notify_opportunity_matches() set search_path = public;

-- Recreate triggers so the updated definitions are used.
drop trigger if exists tr_on_zing_event on public.zing_events;
create trigger tr_on_zing_event
after insert on public.zing_events
for each row
execute function public.fn_notify_event_matches();

drop trigger if exists tr_on_opportunity on public.opportunities;
create trigger tr_on_opportunity
after insert on public.opportunities
for each row
execute function public.fn_notify_opportunity_matches();
