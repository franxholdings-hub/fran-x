<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Base44 dev environment

- **Stack:** TanStack Start (React SSR) + Vite, managed with **bun** (`bun.lock`, `bunfig.toml`). Single web service, no separate backend — SSR server functions run in the same Vite dev process.
- **Run:** `docker compose -f docker-compose.base44.yml up -d` → Vite dev server on host port 3000 (bind-mounted source, live reload). Verify with `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/`.
- **`vite.config.ts`** sets `server.allowedHosts: true` so the preview's external proxy hostname is accepted (Vite blocks unknown hosts by default). Do not remove.
- **Supabase** is remote/hosted. The public/publishable keys (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and non-`VITE_` SSR fallbacks) are committed in `.env` and are enough to boot and render the marketing site.
- **Optional secrets** (not required to boot; wired via `env_file: /run/base44/app.env`):
  - `SUPABASE_SERVICE_ROLE_KEY` — server-side admin DB writes (FRIX chat persistence, admin portal).
  - `LOVABLE_API_KEY` — Lovable AI gateway for the FRIX chat widget (`/api/public/frix`).
  - Without these the site renders normally; the FRIX chat returns "AI is not configured" and admin DB writes fail.
- The lovable vite config bundles its own plugins (TanStack devtools, nitro, tailwind, tsConfigPaths, VITE_* env injection, sandbox detection). Do not re-add those manually.

## FRAN-X Technologies business structure (Sept 2026 restructure)

- **Brand hierarchy:** FRAN-X Holdings (parent) → FRAN-X Technologies (active technology business) → FRIX AI + Technology Services + Digital Products. Communicated on the homepage hierarchy band.
- **The old `/marketplace` routes, marketplace components (`src/components/marketplace/`, `src/lib/marketplace/`) and the portal Marketplace/Vendor Hub sections were REMOVED from the public UX.** The database tables/migrations were intentionally preserved. Digital Products (`/store`) is NOT part of that removal.
- **Navigation** (`navConfig.tsx`): Home, FRIX AI, Services, Digital Products (`/store`), Solutions, Pricing, About, Contact; CTAs "Start a Project" / "Try FRIX AI".
- **Revenue categories** (`REVENUE_CATEGORIES` in `src/lib/ai-integration.ts`): FRIX AI Subscriptions, Web Development, Mobile App Development, AI & Automation, Data & Business Intelligence, Custom Software & APIs, Digital Product Sales, Maintenance/Support, Enterprise Projects, Other. Digital Store purchases are categorized separately in `processVerifiedPayment` (`src/lib/paystack.server.ts`).
- **Admin access:** `useAuth` treats the email `franxholdings@gmail.com` as admin client-side, and `supabase/migrations/20260904000000_franx_admin_email.sql` extends `has_role()` so RLS recognizes it at the DB level (apply the migration to the hosted Supabase project).
- Generated Supabase types (`src/integrations/supabase/types.ts`) are stale (missing `revenue_history`, `payments`, `ai_clients`, `digital_*` tables) — existing code works around it with `as never` casts; `tsc --noEmit` reports pre-existing errors. Regenerating the types would clear most of them.

## App-like navigation system

- **`src/components/navigation/`** contains the app-like navigation system, wired into `__root.tsx` via `AppShell`.
- **Desktop:** `AppSidebar.tsx` — collapsible left sidebar (persisted in `localStorage` key `franx.sidebar.collapsed`), icons + tooltips when collapsed, active highlighting, search trigger, CTA buttons, theme toggle.
- **Mobile:** `MobileHeader.tsx` (compact sticky header with logo/search/notifications/profile) + `MobileNav.tsx` (fixed bottom nav with 5 items + "More" bottom sheet). Safe-area aware via `env(safe-area-inset-bottom)`.
- **Global search:** `GlobalSearch.tsx` — cmdk command palette, opens with `Ctrl+K` / `⌘+K` or `window.dispatchEvent(new CustomEvent("franx:search:open"))`. Searches pages, marketplace categories, quick actions, account items. Recent searches in `localStorage` key `franx.search.recent`.
- **Page transitions:** `animate-page-enter` CSS utility (fade+slide, 0.25s) applied via `key={pathname}` on the Outlet wrapper in `AppShell`.
- **Contextual FAB:** `ContextualFAB.tsx` — shows on marketplace/portal/opportunities pages, positioned bottom-left to avoid FrixWidget (bottom-right).
- **Nav config:** `navConfig.tsx` — single source of truth for all nav items, icons, auth/admin/guest filtering.
- **FrixWidget / WhatsApp button** positions adjusted (`bottom-40` / `bottom-24` on mobile) to clear the mobile bottom nav.
- **DashboardShell** reads URL hash on mount + `hashchange` to sync sidebar deep-links (e.g. `/portal#notifications`).
- The old `Header.tsx` is preserved but no longer rendered; `Footer` is conditionally shown by `AppShell` (hidden on `/portal` and `/admin`).

## FRIX AI Workspace (authenticated member experience, Sept 2026)

- **Route:** `/frix-ai/workspace` (`src/routes/_authenticated/frix-ai.workspace.tsx`, auth-guarded → `/auth`). The public `/frix-ai` marketing page links to it ("Open FRIX Workspace"); the visitor widget still opens via the `frix:open` event but has **no floating launcher button** anymore (removed Sept 2026; WhatsApp button remains).
- **API:** `src/routes/api/frix/{chat,conversations,conversation,account}.ts` — authenticated with `getUserFromRequest` (Bearer token). Server-side ownership checks, subscription/usage enforcement (402 + `limitReached` on new-conversation overage), title/mode persistence, regenerate (deletes trailing assistant message server-side).
- **Plan/usage resolution** in `src/lib/frix-server.ts` (`resolveFrixAccount`): latest `subscriptions` row → `ai_packages.usage_limit` is the monthly conversation limit; users without an active/trial sub fall back to the `explorer` package's `usage_limit` (DB-driven, admin-editable). Usage counts are live queries over `ai_conversations`/`ai_messages` (`user_id`, month window). AI gateway call is aggregated SSE, same as `/api/public/frix`.
- **Modes** (pidgin/exam/lowdata) and **tools** (writing/summarize/business/data/productivity) are real instruction injections in `frix-server.ts` — no dead buttons.
- **Migration required:** `supabase/migrations/20260905120000_franx_frix_workspace.sql` adds `title`/`mode` to `ai_conversations`. Chat creation tolerates the columns missing (falls back to a minimal insert); rename and stored modes only work once it's applied to the hosted Supabase project.
- **File/image upload and voice are intentionally absent** from the workspace — no backend integration exists, and the product rule is "no fake controls".
