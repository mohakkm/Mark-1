# Database Schema (Supabase / Postgres)

Idea is a first-class object from day one — every lead belongs to exactly one
idea. This is cheap now and expensive to retrofit later, so it's non-negotiable
even though there's currently only one user.

---

## `ideas`
| column | type | notes |
|---|---|---|
| id | uuid, pk | |
| user_id | uuid | fk → auth.users, nullable for now (single user) |
| name | text | e.g. "Founder CRM", "Coldcall SaaS" |
| description | text | your pitch/problem statement |
| target_customer | text | who you're validating with |
| created_at | timestamptz | default now() |

---

## `leads`
| column | type | notes |
|---|---|---|
| id | uuid, pk | |
| idea_id | uuid | fk → ideas.id, required |
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
| lead_id | uuid | fk → leads.id |
| type | text | enum: outgoing, incoming |
| content | text | the message text (generated or pasted reply) |
| created_at | timestamptz | default now() |

---

## `insights`
| column | type | notes |
|---|---|---|
| id | uuid, pk | |
| lead_id | uuid | fk → leads.id |
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

## Notes on scaling later (do not build now)
- Row-Level Security (RLS) policies on all four tables, keyed on `user_id`,
  required before any second user is ever invited in. Until then `user_id`
  columns can stay nullable/unused.
- No `enrichment`, `tags`, `lead_score` fields — explicitly out of scope, see
  checklist.md.
