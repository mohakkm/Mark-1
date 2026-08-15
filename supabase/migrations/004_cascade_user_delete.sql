-- Migration 004: Add ON DELETE CASCADE to ideas.user_id → auth.users(id)
--
-- The downstream foreign keys already have ON DELETE CASCADE:
--   leads.idea_id      → ideas(id)         ON DELETE CASCADE  (001_initial_schema)
--   conversations.lead_id → leads(id)      ON DELETE CASCADE  (001_initial_schema)
--   insights.lead_id   → leads(id)         ON DELETE CASCADE  (001_initial_schema)
--   ai_usage_log.user_id  → auth.users(id) ON DELETE CASCADE  (003_ai_usage_limits)
--
-- The only missing link is ideas.user_id → auth.users(id), which has no
-- delete rule and would cause a FK violation when a user account is deleted.
-- This migration drops the existing constraint and re-adds it with CASCADE.

begin;

-- Find and drop the existing FK on ideas.user_id.
-- PostgreSQL auto-names it "ideas_user_id_fkey" by convention; using the
-- explicit name makes the drop idempotent and easy to roll back.
alter table public.ideas
  drop constraint if exists ideas_user_id_fkey;

alter table public.ideas
  add constraint ideas_user_id_fkey
    foreign key (user_id)
    references auth.users (id)
    on delete cascade;

commit;
