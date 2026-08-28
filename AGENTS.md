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
