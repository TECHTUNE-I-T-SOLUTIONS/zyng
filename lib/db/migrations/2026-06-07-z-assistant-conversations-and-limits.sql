-- Z assistant conversations, voice-call transcripts, and usage limits.
-- Run this in the Supabase SQL editor, then reload the schema if your client cache does not refresh immediately.

create extension if not exists pgcrypto;

create table if not exists public.z_ai_usage_limits (
  id uuid primary key default gen_random_uuid(),
  scope text not null default 'default',
  daily_text_messages integer not null default 80 check (daily_text_messages >= 0),
  daily_voice_minutes integer not null default 10 check (daily_voice_minutes >= 0),
  max_call_seconds integer not null default 600 check (max_call_seconds >= 30),
  daily_input_tokens integer not null default 60000 check (daily_input_tokens >= 0),
  daily_output_tokens integer not null default 80000 check (daily_output_tokens >= 0),
  daily_tts_requests integer not null default 60 check (daily_tts_requests >= 0),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scope)
);

insert into public.z_ai_usage_limits (scope)
values ('default')
on conflict (scope) do nothing;

create table if not exists public.z_ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  persona_id uuid references public.personas(id) on delete set null,
  mode text not null default 'chat' check (mode in ('chat', 'call')),
  status text not null default 'active' check (status in ('active', 'ended', 'rate_limited', 'failed')),
  title text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  total_input_tokens integer not null default 0 check (total_input_tokens >= 0),
  total_output_tokens integer not null default 0 check (total_output_tokens >= 0),
  total_audio_seconds integer not null default 0 check (total_audio_seconds >= 0),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.z_ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.z_ai_conversations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  persona_id uuid references public.personas(id) on delete set null,
  role text not null check (role in ('user', 'assistant', 'system')),
  input_type text not null default 'text' check (input_type in ('text', 'speech', 'system')),
  content text not null default '',
  transcript text,
  audio_url text,
  model text,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  audio_seconds integer not null default 0 check (audio_seconds >= 0),
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.z_ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  conversation_id uuid references public.z_ai_conversations(id) on delete set null,
  event_type text not null check (event_type in ('chat_message', 'voice_input', 'voice_output', 'call_started', 'call_ended', 'tts')),
  units integer not null default 1 check (units >= 0),
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  audio_seconds integer not null default 0 check (audio_seconds >= 0),
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists z_ai_conversations_user_started_idx
  on public.z_ai_conversations (user_id, started_at desc);

create index if not exists z_ai_conversations_status_idx
  on public.z_ai_conversations (status, started_at desc);

create index if not exists z_ai_messages_conversation_created_idx
  on public.z_ai_messages (conversation_id, created_at asc);

create index if not exists z_ai_usage_events_user_created_idx
  on public.z_ai_usage_events (user_id, created_at desc);

create or replace function public.set_z_ai_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists z_ai_usage_limits_updated_at on public.z_ai_usage_limits;
create trigger z_ai_usage_limits_updated_at
before update on public.z_ai_usage_limits
for each row execute function public.set_z_ai_updated_at();

create or replace function public.z_ai_daily_usage(
  p_user_id uuid,
  p_day date default current_date
)
returns table (
  text_messages integer,
  voice_seconds integer,
  tts_requests integer,
  input_tokens integer,
  output_tokens integer,
  call_starts integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(sum(case when event_type = 'chat_message' then units else 0 end), 0)::integer as text_messages,
    coalesce(sum(case when event_type in ('voice_input', 'voice_output') then audio_seconds else 0 end), 0)::integer as voice_seconds,
    coalesce(sum(case when event_type = 'tts' then units else 0 end), 0)::integer as tts_requests,
    coalesce(sum(input_tokens), 0)::integer as input_tokens,
    coalesce(sum(output_tokens), 0)::integer as output_tokens,
    coalesce(sum(case when event_type = 'call_started' then units else 0 end), 0)::integer as call_starts
  from public.z_ai_usage_events
  where user_id = p_user_id
    and created_at >= p_day::timestamptz
    and created_at < (p_day + 1)::timestamptz;
$$;

create or replace function public.z_ai_can_use(
  p_user_id uuid,
  p_requested_text_messages integer default 1,
  p_requested_voice_seconds integer default 0,
  p_requested_input_tokens integer default 0,
  p_requested_output_tokens integer default 0,
  p_requested_tts_requests integer default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_limits public.z_ai_usage_limits%rowtype;
  v_usage record;
  v_allowed boolean;
begin
  select * into v_limits
  from public.z_ai_usage_limits
  where scope = 'default' and enabled = true
  limit 1;

  if not found then
    return jsonb_build_object('allowed', false, 'reason', 'Z usage is disabled.');
  end if;

  select * into v_usage from public.z_ai_daily_usage(p_user_id, current_date);

  v_allowed :=
    (v_usage.text_messages + p_requested_text_messages) <= v_limits.daily_text_messages
    and (v_usage.voice_seconds + p_requested_voice_seconds) <= (v_limits.daily_voice_minutes * 60)
    and (v_usage.input_tokens + p_requested_input_tokens) <= v_limits.daily_input_tokens
    and (v_usage.output_tokens + p_requested_output_tokens) <= v_limits.daily_output_tokens
    and (v_usage.tts_requests + p_requested_tts_requests) <= v_limits.daily_tts_requests;

  return jsonb_build_object(
    'allowed', v_allowed,
    'limits', to_jsonb(v_limits),
    'usage', to_jsonb(v_usage),
    'remaining', jsonb_build_object(
      'text_messages', greatest(v_limits.daily_text_messages - v_usage.text_messages, 0),
      'voice_seconds', greatest((v_limits.daily_voice_minutes * 60) - v_usage.voice_seconds, 0),
      'input_tokens', greatest(v_limits.daily_input_tokens - v_usage.input_tokens, 0),
      'output_tokens', greatest(v_limits.daily_output_tokens - v_usage.output_tokens, 0),
      'tts_requests', greatest(v_limits.daily_tts_requests - v_usage.tts_requests, 0),
      'max_call_seconds', v_limits.max_call_seconds
    )
  );
end;
$$;

alter table public.z_ai_usage_limits enable row level security;
alter table public.z_ai_conversations enable row level security;
alter table public.z_ai_messages enable row level security;
alter table public.z_ai_usage_events enable row level security;

drop policy if exists "Users can read default Z AI limits" on public.z_ai_usage_limits;
create policy "Users can read default Z AI limits"
on public.z_ai_usage_limits for select
to authenticated
using (enabled = true);

drop policy if exists "Users can read own Z AI conversations" on public.z_ai_conversations;
create policy "Users can read own Z AI conversations"
on public.z_ai_conversations for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own Z AI conversations" on public.z_ai_conversations;
create policy "Users can create own Z AI conversations"
on public.z_ai_conversations for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own Z AI conversations" on public.z_ai_conversations;
create policy "Users can update own Z AI conversations"
on public.z_ai_conversations for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own Z AI messages" on public.z_ai_messages;
create policy "Users can read own Z AI messages"
on public.z_ai_messages for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own Z AI messages" on public.z_ai_messages;
create policy "Users can create own Z AI messages"
on public.z_ai_messages for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can read own Z AI usage events" on public.z_ai_usage_events;
create policy "Users can read own Z AI usage events"
on public.z_ai_usage_events for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own Z AI usage events" on public.z_ai_usage_events;
create policy "Users can create own Z AI usage events"
on public.z_ai_usage_events for insert
to authenticated
with check (auth.uid() = user_id);

grant select on public.z_ai_usage_limits to authenticated;
grant select, insert, update on public.z_ai_conversations to authenticated;
grant select, insert on public.z_ai_messages to authenticated;
grant select, insert on public.z_ai_usage_events to authenticated;
grant execute on function public.z_ai_daily_usage(uuid, date) to authenticated;
grant execute on function public.z_ai_can_use(uuid, integer, integer, integer, integer, integer) to authenticated;

notify pgrst, 'reload schema';
