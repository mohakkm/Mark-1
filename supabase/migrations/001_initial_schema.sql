-- Idea Validation CRM — initial schema (see docs/database.md)

create table ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id),
  name text not null,
  description text not null,
  target_customer text not null,
  created_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references ideas (id) on delete cascade,
  name text not null,
  company text,
  role text,
  headline text,
  linkedin_url text,
  raw_pasted_profile text not null,
  status text not null default 'not_contacted'
    check (status in ('not_contacted', 'messaged', 'replied', 'interested', 'not_interested')),
  notes text,
  last_contact timestamptz,
  created_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  type text not null check (type in ('outgoing', 'incoming')),
  content text not null,
  created_at timestamptz not null default now()
);

create table insights (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  summary text not null,
  pain_points jsonb not null default '[]'::jsonb,
  objections jsonb not null default '[]'::jsonb,
  suggestions jsonb not null default '[]'::jsonb,
  interest_level text not null check (interest_level in ('low', 'medium', 'high')),
  created_at timestamptz not null default now()
);

create index leads_idea_id_idx on leads (idea_id);
create index conversations_lead_id_idx on conversations (lead_id);
create index insights_lead_id_idx on insights (lead_id);
