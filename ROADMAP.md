# Emberfall Keep — React Router Migration Roadmap

Moving from Astro + TinaCMS + markdown content to **React Router v7 framework mode** (SSR on Cloudflare Workers) with **D1** as the data store.

Each phase ends in a runnable state.

---

## Phase 0 — Reference project

- [ ] Scaffold the official template in a scratch dir (not this repo):
      `pnpm create react-router@latest --template remix-run/react-router-templates/cloudflare-d1`
- [ ] Use it as the reference for how `vite.config.ts`, `react-router.config.ts`, the worker entry, and `wrangler.jsonc` fit together

## Phase 1 — Framework-mode shell (no data yet)

**Dependencies** (new)
- [ ] `react-router`, `@react-router/dev`, `@cloudflare/vite-plugin`, `wrangler`
- [ ] Verify `@react-router/dev` supports Vite 8 — fall back to the template's Vite version if not

**Config**
- [ ] `react-router.config.ts` — `ssr: true`, `appDirectory: "src"`
- [ ] `vite.config.ts` — replace `react()` with `cloudflare()` + `reactRouter()`
- [ ] Confirm the React Compiler babel preset still runs (it's currently wired via `@vitejs/plugin-react`)
- [ ] Add a worker entry (template's `workers/app.ts`)

**Remove**
- [ ] `index.html`, `src/main.tsx`, `src/index.tsx` (empty), `src/components/Layout.tsx`

**`src/root.tsx`**
- [ ] `<html>` shell with `<Meta/>`, `<Links/>`, `<ScrollRestoration/>`, `<Scripts/>`
- [ ] Bunny fonts + Font Awesome via `links` export
- [ ] Import `normalize.css` and `styles/global.css`
- [ ] Render `Nav` / `<Outlet/>` / `Footer`
- [ ] `ErrorBoundary` (replaces `404.astro`)

**`src/routes.ts`** — placeholder route per Astro page
- [ ] `/`
- [ ] `/about`
- [ ] `/campaigns/:slug`
- [ ] `/characters`
- [ ] `/characters/:slug`
- [ ] `/characters/:slug/edit`
- [ ] `/sessions`
- [ ] `/sessions/:slug`
- [ ] `/lore`
- [ ] `/lore/npcs/:slug`
- [ ] `/lore/factions/:slug`
- [ ] `/lore/items/:slug`
- [ ] `/maps`
- [ ] `/gamemasters`

**Nav / meta**
- [ ] `Nav` → `<NavLink>` (`isActive` callback; `end` prop on `/`), drop the `currentPath` prop
- [ ] Close the mobile menu on route change
- [ ] Keep login/logout as plain `<a>` (they need a full page load)
- [ ] Per-route `meta` exports for titles

**Done when:** `pnpm dev` runs and every nav link resolves.

## Phase 2 — Database

- [ ] Create a **new** D1 database — don't reuse `emberfallkeep-db`. D1 tracks applied migrations by filename, so a new `0001_init.sql` would be silently skipped there.
- [ ] Add the `DB` binding to `wrangler.jsonc`
- [ ] Run `wrangler types` + `react-router typegen` for typed `env` and `Route.LoaderArgs`

**Conventions**
- `id TEXT PRIMARY KEY` via `crypto.randomUUID()`, plus `slug TEXT UNIQUE` for URLs
- `created_at` / `updated_at` / `deleted_at` as ISO 8601 `TEXT`
- Enums → `CHECK (col IN (...))`; booleans → `INTEGER` 0/1
- Migrations: `migrations/0001_init.sql`, `0002_...`

**Tables**

| Table | Notes |
|---|---|
| `players` | `discord_id UNIQUE`, `username`, `avatar` |
| `campaigns` | Drop `lastSession` / `partySize` — derive them |
| `gamemasters` + `campaign_gamemasters` | GM → `player_id`; replaces the `DM_DISCORD_IDS` env allowlist |
| `characters` | Merge markdown frontmatter + old `character_state` into one row; FK `player_id`, `campaign_id` |
| `inventory_items` | FK `character_id`; replaces the JSON blob |
| `game_sessions` + `session_attendance` | Named to avoid confusion with auth sessions; `UNIQUE(campaign_id, session_number)` |
| `npcs`, `factions`, `items` | Add `body TEXT` for the former markdown body; optional `faction_members` join for `notableMembers` |
| `maps` + `map_pins` | Pins FK `map_id`, optional `session_id` |

- [ ] Write `0001_init.sql`
- [ ] Apply locally: `wrangler d1 migrations apply <db> --local`
- [ ] Hand-write `seed.sql` (not a migration); load with `wrangler d1 execute <db> --local --file=seed.sql`

## Phase 3 — Read-only pages

- [ ] Each route's `loader` queries `context.cloudflare.env.DB` with prepared statements
- [ ] Components consume `useLoaderData()`; existing cards stay as-is
- [ ] **Strip `dm_notes` in loaders** unless the viewer is a GM — everything a loader returns is serialized to the client
- [ ] Render `body` markdown (new dependency: `marked` or `react-markdown`)
- [ ] Images stay in `public/uploads` for now

## Phase 4 — Discord auth

- [ ] Port `lib/session.ts` unchanged (Web Crypto only — Workers-compatible)
- [ ] Login / callback as loader-only resource routes; logout as a POST `action`
- [ ] Replace Astro middleware with a `getPlayer(request, env)` helper (React Router `middleware` is a later option)
- [ ] Root `loader` returns the player; `Nav` reads it via `useRouteLoaderData('root')`
- [ ] Remove the `pd` display cookie entirely
- [ ] Permissions: ownership via `characters.player_id`, GM via `campaign_gamemasters`
- [ ] Secrets in `.dev.vars` locally, `wrangler secret put` for prod:
      `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI`, `DISCORD_GUILD_ID`, `SESSION_SECRET`

## Phase 5 — Character editing

- [ ] Replace `PATCH /api/characters/:slug` with `<Form method="post">` + `action` on `/characters/:slug/edit`
- [ ] Validation — add `zod` explicitly if keeping it (it was only available transitively via Astro)

## Phase 6 — Deploy

- [ ] `wrangler d1 migrations apply <db> --remote`
- [ ] `wrangler deploy`
- [ ] Port `.github/workflows/deploy.yml` from the Astro repo; run migrations before deploy

## Later

- [ ] GM admin panel (create/edit/soft-delete content)
- [ ] R2 for image uploads
- [ ] Fix or define `badge-teal` / `badge-gold` / `badge-muted` (used by `CampaignCard`, never defined)
