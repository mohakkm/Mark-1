-- Migration 005: Invite-only signup gating
--
-- Creates allowed_emails table. At signup time, the app checks this list
-- before creating or accepting a new auth user:
--   - Email/password:  checked server-side via a Server Action (service role)
--                      before calling supabase.auth.signUp()
--   - Google OAuth /   checked in /auth/callback after exchangeCodeForSession;
--     any future OAuth  new user is deleted via admin client if not on the list
--
-- To invite someone: INSERT INTO public.allowed_emails (email, note)
--                    VALUES ('friend@example.com', 'Beta tester');
-- (Use Supabase Table Editor — no admin UI needed at this scale.)

begin;

create table public.allowed_emails (
  email    text primary key,            -- case-insensitive matching done in app (lowercased)
  added_at timestamptz not null default now(),
  note     text                         -- optional context: who/why
);

-- Only the service-role key (admin client) should read/write this table.
-- The anon / authenticated roles must NOT be able to query it directly,
-- so we skip RLS and instead restrict via Postgres grants.
alter table public.allowed_emails enable row level security;

-- No policies → authenticated users cannot read the table at all via the
-- anon/authenticated PostgREST roles. Only service_role bypasses RLS.

-- Backfill: seed every existing auth.users email so current users aren't
-- locked out when this migration is applied.
insert into public.allowed_emails (email, note)
select
  lower(email),
  'Auto-seeded from existing auth.users on migration 005'
from auth.users
where email is not null
on conflict (email) do nothing;

commit;
