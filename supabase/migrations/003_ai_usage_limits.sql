-- Migration 003: AI Usage limits and logging

create table public.ai_usage_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  action_type text not null check (action_type in ('message_generation', 'insight_extraction')),
  created_at timestamptz not null default now()
);

alter table public.ai_usage_log enable row level security;

create policy ai_usage_log_select_own
  on public.ai_usage_log
  for select
  to authenticated
  using (user_id = auth.uid());

create policy ai_usage_log_insert_own
  on public.ai_usage_log
  for insert
  to authenticated
  with check (user_id = auth.uid());

create index ai_usage_log_user_id_created_at_idx
  on public.ai_usage_log (user_id, created_at);
