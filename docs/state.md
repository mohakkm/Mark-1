# Current State (update this every session, before you stop)

Last updated: 2026-08-03 — by: Copilot CLI

## What's currently working
- Phase 1 verified end-to-end: signup/login, Supabase connected, all four tables live
- Next.js 16 + TypeScript + TailwindCSS scaffold at repo root
- Supabase Auth: `/login` (sign in / sign up), `/auth/callback`, middleware session guard
- Database migration applied: `ideas`, `leads`, `conversations`, `insights`
- Git remote: `https://github.com/mohakkm/Mark-1.git`
- Phase 2 complete & verified:
  - Ideas CRUD: `/api/ideas` (GET/POST), `/api/ideas/[id]` (GET/PATCH/DELETE)
  - Server Actions in `src/app/actions/ideas.ts` (`createIdeaAction`, `updateIdeaAction`, `deleteIdeaAction`, `selectIdea`)
  - Persistent active idea selection via `selected_idea_id` cookie (`src/lib/selected-idea.ts`)
  - Modern UI components: `IdeaSwitcher`, `IdeaModal` (create & edit), `IdeasManagerModal` (list/filter/manage), `IdeaDetailsCard`, `DashboardView`
- Phase 3 complete & verified:
  - `src/lib/groq.ts`: Calls Groq API (`llama-3.3-70b-versatile`) with strict profile detection instructions (`is_valid_profile` boolean flag) and explicit validation rules. Throws `"Couldn't detect a LinkedIn profile in this text — please check your paste."` if non-profile/random text is submitted or if name/role/company/headline are absent.
  - Leads API Routes:
    - `POST /api/leads`: Accepts raw profile text, idea_id, optional linkedin_url/notes; parses profile via Groq API and inserts lead into DB with status `not_contacted`. Returns 400 Bad Request on profile parsing failure.
    - `GET /api/leads?idea_id=&status=`: Lists leads scoped to specified idea with optional status filter.
    - `GET /api/leads/[id]`, `PATCH /api/leads/[id]`, `DELETE /api/leads/[id]`: Single lead detail, status/notes update, and deletion.
  - Leads Server Actions: `createLeadAction`, `updateLeadStatusAction`, `deleteLeadAction` in `src/app/actions/leads.ts`.
  - Phase 3 UI Components:
    - `AddLeadModal`: Single textarea for pasting LinkedIn profile text with explicit error alert rendering.
    - `LeadsList`: Table view displaying leads scoped to active idea, inline status dropdown switcher (`not_contacted`, `messaged`, `replied`, `interested`, `not_interested`), search bar by name/role/company, status filter, and raw profile text inspector modal.
  - Lead detail route + UI:
    - New route: `src/app/leads/[id]/page.tsx` loads authenticated lead details and validates ownership through the linked idea.
    - `LeadDetailView` is now wired and reachable from the leads list (lead name and action icon).
    - Detail page explicitly shows structured profile fields (`name`, `role`, `company`, `headline`, `status`, `notes`) plus `raw_pasted_profile`.
    - Conversation and insight history sections are visible with intentional empty states for now.
  - Hydration-safe date rendering:
    - Replaced locale-dependent client/server date rendering with fixed UTC format helpers in `src/lib/date-format.ts`.
    - Leads and lead-detail date fields now render deterministic strings across server and client.

## What's mid-implementation / half-done
- None in Phase 3.

## Known gaps (deferred, not blocking)
- **Password reset page** — no `/forgot-password` or reset flow yet. Single-user app; founder can recover via Supabase dashboard if needed. Add before any second user.

## What broke last session and why (so the next agent doesn't repeat it)
- Pasting non-LinkedIn text previously allowed Groq to guess/hallucinate names ("Unknown Lead" or random webpage author). Resolved by adding strict `is_valid_profile` check and metadata presence verification in `src/lib/groq.ts`.
- `FolderGear` icon export in `lucide-react` does not exist; replaced with `FolderCog`.

## Next concrete step
- Phase 4: AI Messaging ("Generate First Message" using idea context + lead profile).
