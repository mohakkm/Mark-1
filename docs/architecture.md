# Architecture

## What this is
A single-user (for now) web app for running structured idea-validation outreach:
paste a lead's profile in, AI drafts a message, you send it manually, paste their
reply back in, AI extracts signal, dashboard tells you if the idea is validated.

No scraping. No auto-send. Every LinkedIn action is done by a human, manually.
This is the permanent safety boundary of the product, not a temporary MVP shortcut —
do not erode it later without re-reading why (see checklist "out of scope").

---

## Stack

- **Frontend + Backend**: Next.js (App Router) + TypeScript, deployed on Vercel
- **Styling**: TailwindCSS
- **DB**: Supabase (Postgres)
- **Auth**: Supabase Auth (single user initially — no RLS complexity yet, add before
  ever inviting a second user)
- **AI**: Groq API (free tier, Llama models) — used for:
  1. Structuring pasted profile text → JSON
  2. Generating first outreach message
  3. Generating follow-up message
  4. Extracting insights from pasted reply text

  Cost note: entire stack is free at this scale except AI calls. Groq's free
  tier covers this comfortably at ~30 leads/month (~120 short calls). If
  insight-extraction quality feels weak once real replies are being processed,
  the one worthwhile upgrade is swapping just that route to Claude API
  (Anthropic) — pay-per-token, realistically under ₹300/month at this volume.
  Keep message-gen and profile-structuring on Groq either way; extraction
  quality is the only place worth paying for.

No browser extension. No headless browser. No third-party scraping API.

---

## Core user flow

1. User creates an **Idea** (name, description, target customer) — this scopes
   everything below it.
2. User manually finds a lead on LinkedIn, copies the visible profile text block.
3. User pastes it into "Add Lead" → backend sends raw text to Groq API →
   gets back structured JSON (name, role, company, headline) → saved as a Lead
   row, linked to the current Idea.
4. User clicks "Generate First Message" → Groq API drafts a short outreach
   message using the Idea's context + the Lead's profile → shown with a
   copy-to-clipboard button.
5. User pastes that message into LinkedIn themselves and sends it. The app never
   touches LinkedIn's UI or API for sending.
6. When a reply comes in, user copies it and pastes it into the Lead's detail
   page → Groq API extracts a summary, pain points, objections, interest
   level → saved as an Insight row → Lead status auto-updates (e.g. "Replied").
7. Validation Dashboard aggregates Insights across all Leads for the current
   Idea: reply rate, interest distribution, recurring pain points/objections.

---

## API routes (Next.js route handlers)

- `POST /api/ideas` — create idea
- `GET /api/ideas` — list ideas
- `POST /api/leads` — accepts raw pasted profile text + idea_id, returns
  structured lead after Groq call, saves to DB
- `GET /api/leads?idea_id=` — list leads for an idea
- `POST /api/leads/:id/message` — generate first message or follow-up
  (pass `type: "first" | "followup"`)
- `POST /api/leads/:id/reply` — accepts raw pasted reply text, runs Groq
  extraction, saves Insight, updates lead status
- `GET /api/ideas/:id/dashboard` — aggregated validation stats for an idea

Every route that calls Groq must handle and surface API errors to the UI —
don't let a failed AI call silently do nothing (see checklist Polish phase,
but basic try/catch is required from Phase 3 onward, not deferred).

---

## Env vars (`.env.local`, never committed)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-side only, route handlers
GROQ_API_KEY=                    # server-side only, never exposed to client
ANTHROPIC_API_KEY=               # optional — only if/when upgrading insight
                                  # extraction later, see stack cost note above
```

---

## Cross-platform / cross-agent build discipline

You (the founder) are building this sequentially across VSCode, Cursor, and
Antigravity — one platform at a time, switching when free tokens run out, not
in parallel. To keep every fresh agent session unconfused:

1. One git repo. Every session starts with `git pull`, ends with `git push`.
2. Before switching platforms or ending a session: update `docs/checklist.md`
   (what's done) and `docs/state.md` (what's mid-flight or broken).
3. Every new agent session's first instruction should be: "Read docs/checklist.md,
   docs/architecture.md, docs/database.md, and docs/state.md before doing anything."
4. Do not let an agent invent new fields, routes, or conventions not listed in
   these docs — if it needs to, it must add them here, not just in code.
