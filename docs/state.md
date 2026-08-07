# Current State (update this every session, before you stop)

Last updated: 2026-08-07 — by: Trae

## What's currently working
- Phase 1 verified end-to-end: signup/login, Supabase connected, all four tables live
- Next.js 16 + TypeScript + TailwindCSS scaffold at repo root
- Supabase Auth: `/login` (sign in / sign up / forgot password), `/auth/callback` (handles `type=recovery` redirect), `/reset-password` set-new-password page, middleware session guard
- Password reset flow complete:
  - `/login` "Forgot password?" → enters email-only forgot mode → calls `supabase.auth.resetPasswordForEmail` with `redirectTo=${origin}/auth/callback?type=recovery`
  - `/auth/callback` detects `type=recovery` after `exchangeCodeForSession`, redirects to `/reset-password` (instead of "/")
  - `/reset-password` (new route: [src/app/reset-password/page.tsx](file:///c:/Users/Mohakk/Desktop/Mark-1/src/app/reset-password/page.tsx), form: [src/app/reset-password/reset-password-form.tsx](file:///c:/Users/Mohakk/Desktop/Mark-1/src/app/reset-password/reset-password-form.tsx)):
    - Client-side `useEffect` parses `window.location.hash` for legacy Implicit Flow `access_token` + `type=recovery`, calls `setSession` if present
    - Falls back to checking active session (from PKCE callback redirect) via `getUser()`
    - Renders "Verifying reset link…" loading state until session confirmed
    - Shows set-new-password form with two fields (password + confirm password), min length 6, match validation
    - On submit: calls `supabase.auth.updateUser({ password })`, signs out, redirects to `/login?reset=success`
    - Invalid/expired link shows error with "Back to sign in" CTA; also shows "Cancel and return to sign in" during valid session
  - Middleware `isAuthRoute` whitelist extended to include `/reset-password` so unauthenticated (pre-session-recovery) visitors reach it
  - Login page shows success banner via `reset=success` query param: "Password updated. Please sign in with your new password."
- Login/signup page light cleanup: added `py-12` vertical page padding, `mt-2` label→input spacing, `mt-8` heading→form spacing, `space-y-5` form items (up from `space-y-4`), `py-2.5` submit button (up from `py-2`), `mt-6` action buttons block, `space-y-2` between stacked action links, wrapped password label + forgot link in `flex justify-between`, added `autoComplete` hints on email/password inputs, success messages use `text-emerald-600` with `pt-1`, forgot email mode hides password field, forgot mode shows "Back to sign in" link
- Database migration applied so far: `ideas`, `leads`, `conversations`, `insights`
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
- Phase 4 complete & verified:
  - New route: `POST /api/leads/[id]/message` in `src/app/api/leads/[id]/message/route.ts`.
    - Supports `type: "first" | "followup"`.
    - Uses idea context (`name`, `description`, `target_customer`) + lead profile (`name`, `role`, `company`, `headline`) for generation.
    - Follow-up uses previous outgoing conversation and `days elapsed` from `last_contact`.
    - Saves generated message to `conversations` as `type: outgoing` and updates `leads.last_contact` (and status to `messaged` when first contact).
  - `src/lib/groq.ts` now includes outreach message generation with guardrails:
    - <=90 words, non-empty, basic malformed/gibberish checks.
    - Explicit error surfacing when output is broken.
  - Lead detail Conversations tab now supports:
    - Generate First Message
    - Generate Follow-up
    - Generated message textbox + copy button (manual LinkedIn copy/paste only; no auto-send)
    - Persisted conversation history rendering.
  - Follow-up quality fix:
    - Follow-up prompt now explicitly includes previous outgoing message text and days elapsed since last contact.
    - First-message generation is now blocked after one outgoing message exists for a lead; follow-up must be used afterward.
- Phase 5 complete & verified:
  - New route: `POST /api/leads/[id]/reply` in `src/app/api/leads/[id]/reply/route.ts`.
    - Accepts pasted reply text.
    - Runs Groq extraction with structured output validation.
    - Saves raw reply to `conversations` with `type: incoming`.
    - Saves extracted insight to `insights` linked to `lead_id`.
    - Updates lead status to `replied` unless already `interested` / `not_interested` (no downgrade).
  - `src/lib/groq.ts` now includes reply extraction for:
    - `summary`, `pain_points`, `objections`, `current_solution`, `feature_requests`, `buying_signals`, `interest_level`.
    - Rejects weak/garbage outputs and invalid enums instead of fabricating.
  - Lead detail UI updates in `src/components/lead-detail-view.tsx`:
    - Added "Paste Reply" textarea + capture button in Conversations tab.
    - Shows API validation/runtime errors inline.
    - Immediately appends incoming conversation and new insight after successful capture.
    - Insights tab now shows read-only summary, pain points, objections, and interest level.
- Phase 6 complete & verified:
  - New shared analytics types in `src/types/dashboard.ts`.
  - New aggregate helper in `src/lib/dashboard.ts`.
  - New route: `GET /api/ideas/[id]/dashboard` in `src/app/api/ideas/[id]/dashboard/route.ts`.
  - New dashboard analytics view in `src/components/validation-dashboard.tsx`.
  - `src/app/page.tsx` builds idea-scoped dashboard analytics server-side.
  - `src/components/dashboard-view.tsx` renders the validation dashboard above the leads list and updates it with the active idea.
  - Validation completed on 2026-08-04:
    - `npm run lint` passes.
    - `npm run build` passes.
- Security hardening prepared on 2026-08-05:
  - New migration: `supabase/migrations/002_enable_rls.sql`
    - Backfills any null `ideas.user_id` rows to the existing owner account.
    - Sets `ideas.user_id` to `NOT NULL`.
    - Enables RLS on `ideas`, `leads`, `conversations`, and `insights`.
    - Adds SELECT / INSERT / UPDATE / DELETE policies enforcing `auth.uid()` ownership:
      - direct ownership on `ideas`
      - ownership via parent `idea_id` on `leads`
      - ownership via `lead_id -> leads.idea_id -> ideas.user_id` on `conversations` and `insights`
  - App-side ownership checks were tightened to match the RLS model:
    - `src/app/api/ideas/route.ts`
    - `src/app/api/ideas/[id]/route.ts`
    - `src/app/actions/ideas.ts`
    - `src/app/api/leads/route.ts`
    - `src/app/actions/leads.ts`
  - Remote data check completed against the hosted Supabase project:
    - Existing `ideas.user_id` rows were checked via the Data API on 2026-08-05.
    - Result: 3 ideas total, 0 rows with `user_id IS NULL`, so no remote backfill was needed.

## What's mid-implementation / half-done
- Hosted database security apply/verify is pending:
  - `002_enable_rls.sql` is present in the repo but was not executed against the hosted Supabase database from this environment.
  - As a result, hosted RLS behavior and Supabase Security Scanner clearance were not directly verified in this session.

## Known gaps (deferred, not blocking)
- **Next.js 16 warning** — the build warns that the `middleware` file convention is deprecated in favor of `proxy`; current build still succeeds.
- **Node runtime warning** — the build warns that future `@supabase/supabase-js` releases will require Node.js 22+; current build still succeeds on Node.js 20.

## What broke last session and why (so the next agent doesn't repeat it)
- Pasting non-LinkedIn text previously allowed Groq to guess/hallucinate names ("Unknown Lead" or random webpage author). Resolved by adding strict `is_valid_profile` check and metadata presence verification in `src/lib/groq.ts`.
- `FolderGear` icon export in `lucide-react` does not exist; replaced with `FolderCog`.
- The current environment did not expose a usable Supabase management SQL surface:
  - no Supabase CLI available
  - no browser session available for dashboard automation
  - no PAT / database password available for Management API SQL execution

## Next concrete step
- Apply `supabase/migrations/002_enable_rls.sql` in the hosted Supabase project, then verify:
  - app still works under the signed-in owner account
  - Security Scanner no longer flags `ideas`, `leads`, `conversations`, and `insights`
