# Idea Validation CRM — Build Checklist

RULE FOR EVERY AI AGENT / SESSION (Cursor, Antigravity, VSCode/Copilot, whoever):
1. Read `docs/architecture.md` and `docs/database.md` before writing any code.
2. Before you stop (tokens run out or task done), update this checklist AND `docs/state.md`.
3. Never invent a new table field, route, or naming convention without adding it here first.

---

## Phase 0 — Validation Spike (DONE — decision made)
- [x] Attempted LinkedIn DOM scraping via Chrome extension
- [x] Killed extension approach — fragile selectors, ToS ban risk, not worth it at this stage
- [x] Decided: manual paste-in / paste-out flow instead (no scraping, no auto-send)

---

## Phase 1 — Project Setup
- [x] Create repo, single git remote (used across all platforms/sessions)
- [x] Next.js + TypeScript + TailwindCSS scaffold
- [x] Supabase project created
- [x] Supabase Auth wired (single user for now — no multi-tenant RLS yet)
- [x] Env vars (.env.local) documented in `docs/architecture.md` + `.env.local.example`
- [x] Database schema created (see `docs/database.md`) — SQL at `supabase/migrations/001_initial_schema.sql`; apply in Supabase dashboard

---

## Phase 2 — Ideas
- [x] Ideas table + CRUD (create/edit/list ideas)
- [x] Idea switcher component (dropdown/filter at top of dashboard)
- [x] All lead views scoped to currently selected idea

---

## Phase 3 — Leads (manual paste-in)
- [ ] "Add Lead" page: single textarea for pasted LinkedIn profile blob
- [ ] API route: send pasted text to Groq API → structured JSON (name, role, company, headline)
- [ ] Save structured lead to DB, linked to current idea
- [ ] Leads table view (list, search, status filter)
- [ ] Lead detail page

---

## Phase 4 — AI Messaging
- [ ] "Generate First Message" — uses idea context + lead profile → draft outreach (≤90 words)
- [ ] Copy-to-clipboard button (message is sent manually by user on LinkedIn — never automated)
- [ ] "Generate Follow-up" — uses previous message + days elapsed + lead profile

---

## Phase 5 — Reply Capture & Insights
- [ ] "Paste Reply" textarea on lead detail page
- [ ] API route: reply text → Groq API → extract summary, pain points, objections, interest level
- [ ] Store as Insight record, linked to lead
- [ ] Auto-update lead status based on reply (e.g. → "Replied")

---

## Phase 6 — Validation Dashboard (the differentiator — do not skip or de-prioritize)
- [ ] Per-idea summary: total leads, messaged, replied, reply rate %
- [ ] Aggregated sentiment/interest distribution across all leads for the idea
- [ ] Recurring pain points (simple frequency list from Insights)
- [ ] Recurring objections (same)
- [ ] Clear verdict framing: "X/30 replied, Y/30 interested" — this is the whole point of the tool

---

## Phase 7 — Follow-up Queue
- [ ] Leads sorted by last_contact, highlight 3/5/7+ day overdue
- [ ] Nothing automated — just a sorted reminder list

---

## Polish (only after Phase 6 works end-to-end for real use)
- [ ] Loading states
- [ ] Error handling on all API routes
- [ ] Empty states
- [ ] Responsive layout
- [ ] README

---

## Explicitly OUT OF SCOPE — do not build, even if it seems easy
- LinkedIn scraping / DOM automation of any kind
- Auto-connect, auto-send, auto-reply, any automated LinkedIn action
- Bulk outreach / sequences
- Lead discovery / enrichment (Proxycurl, Sales Navigator API, etc.)
- Multi-user auth, RLS, billing — not until Phase 6 is proven on real personal use
- Browser extension of any kind (killed in Phase 0)

If it's not "paste in → AI helps me think/write → paste out", it doesn't belong in this build yet.

---

## Post-validation stretch goals (only if this works for you first)
- [ ] Multi-user auth + Supabase RLS
- [ ] Usage limits / tiers (cap free tier around 30 leads/idea)
- [ ] Plain-language disclaimer page (tool doesn't automate LinkedIn actions)
- [ ] Public landing page / waitlist
