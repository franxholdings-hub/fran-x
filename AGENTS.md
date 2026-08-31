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
