# Database Schema (Supabase / Postgres)

Idea is a first-class object from day one — every lead belongs to exactly one
idea. This is cheap now and expensive to retrofit later, so it's non-negotiable
even though there's currently only one user.

---

## `ideas`
| column | type | notes |
|---|---|---|
| id | uuid, pk | |
| user_id | uuid | fk -> auth.users, required; owner of the idea |
| name | text | e.g. "Founder CRM", "Coldcall SaaS" |
| description | text | your pitch/problem statement |
| target_customer | text | who you're validating with |
| created_at | timestamptz | default now() |

---

## `leads`
| column | type | notes |
|---|---|---|
| id | uuid, pk | |
| idea_id | uuid | fk -> ideas.id, required |
| name | text | from AI-structured paste |
| company | text | nullable |
| role | text | nullable |
| headline | text | nullable |
| linkedin_url | text | nullable — user can paste manually if they want |
| raw_pasted_profile | text | keep the original paste for reference/debugging |
| status | text | enum: not_contacted, messaged, replied, interested, not_interested |
| notes | text | nullable, freeform |
| last_contact | timestamptz | nullable |
| created_at | timestamptz | default now() |

---

## `conversations`
| column | type | notes |
|---|---|---|
| id | uuid, pk | |
| lead_id | uuid | fk -> leads.id |
| type | text | enum: outgoing, incoming |
| content | text | the message text (generated or pasted reply) |
| created_at | timestamptz | default now() |

---

## `insights`
| column | type | notes |
|---|---|---|
| id | uuid, pk | |
| lead_id | uuid | fk -> leads.id |
| summary | text | |
| pain_points | text[] or text | store as JSON array if easier |
| objections | text[] or text | |
| suggestions | text[] or text | |
| interest_level | text | enum: low, medium, high |
| created_at | timestamptz | default now() |

---

## Status values (leads.status)
```
not_contacted
messaged
replied
interested
not_interested
```
Nothing else. Do not add statuses without updating this file first.

---

## Row-Level Security model
- RLS is intended on all four tables via `supabase/migrations/002_enable_rls.sql`.
- `ideas` rows are accessible only when `ideas.user_id = auth.uid()`.
- `leads` rows are accessible only when their `idea_id` belongs to an idea owned by `auth.uid()`.
- `conversations` and `insights` rows are accessible only when their `lead_id` belongs to a lead whose `idea_id` belongs to an idea owned by `auth.uid()`.

---

## Notes on scaling later (do not build now)
- Multi-user auth UX, billing, and broader account management are still deferred; see `docs/checklist.md`.
- No `enrichment`, `tags`, `lead_score` fields — explicitly out of scope, see
  checklist.md.
