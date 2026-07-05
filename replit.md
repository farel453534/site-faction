# Règlement Faction — MSSClick

A dark rules-reference site for a Harry Potter roleplay FiveM server faction. Displays the full faction règlement in expandable accordion cards. Theme: black + gold, modern sans-serif. Branded "Règlement Faction" (NOT "Ministère").

## Current status

The project is imported but **not yet running on Replit**. Both the `Règlement Faction` and `API Server` workflows are currently failing. To get the app running, Task #2 ("Get the app running on Replit") covers the full setup — you need to set the `DATABASE_URL` secret and push the DB schema first.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Site lives in `artifacts/reglement` (react-vite, static, no backend needed).
- `src/App.tsx` — routing (wouter): `/` → Home (accueil), `/:group/:page` → RulePageView.
- `src/components/Layout.tsx` — shared shell: full-width topbar (emblem + search pill + Discord/social pills + "Se connecter") + left icon-only rail (Home + one icon per group, aria-label = group title) with per-group flyout page nav + search-results dropdown + scroll area.
- `src/pages/Home.tsx` — accueil content ("Règlement spécifique au RP", 8 data-driven accordion cards).
- `src/pages/RulePageView.tsx` — generic markdown page (react-markdown + remark-gfm + tailwind typography).
- `src/data/reglement.ts` — SOURCE OF TRUTH for all sub-page content (4 groups, 23 pages), scraped/cleaned markdown.
- `src/lib/search-context.tsx` — global search state.
- `src/index.css` — theme vars, black+gold palette (`--primary: 43 88% 55%`), fonts (Inter body + Poppins repurposed as `--app-font-serif`/`font-serif` for headings/labels), utilities (`.bg-stage` bottom gold glow, `.gold-text`, `.bg-texture`), accordion keyframes.

## Architecture decisions

- Content is mirrored from the public Google Site `sites.google.com/view/mssclick-reglement-faction`. Sub-pages are stored as cleaned markdown in `src/data/reglement.ts` and rendered generically; only the accueil page is bespoke JSX.
- Global search (topbar) filters the sidebar nav by page title; on accueil it also filters the accordions — both read the shared SearchContext.
- Source content emojis (faction rank symbols ☠️⚔️ etc.) are kept intact because they carry meaning, despite the general "no emojis in UI chrome" rule.
- Dark mode only. Visual direction copied "à 100%" from a user reference screenshot: black + gold (warm amber), modern sans-serif (Inter body, Poppins headings/labels), full-width topbar, icon-only left rail, gold accordion cards (book icon + white bold label + chevron). This SUPERSEDES the earlier red/serif "Décret du Ministère" direction, which the user rejected as "trop ancien".
- Do NOT reproduce the reference server's dragon logo (someone else's brand) — use a generic gold Lucide emblem + "Règlement Faction" wordmark.

## Product

Single dark rules-reference site (French) for the MSSClick FiveM faction, branded "Règlement Faction". Left icon rail navigates 4 rule categories (Notions de Bases, Notions RPG, Notions PVP/PVE, Factions) via flyout panels, plus the accueil règlement. Each page shows the faction rules; topbar has search + Discord/social links.

## User preferences

- Répondre en français ; l'utilisateur est non-technique.
- Thème NOIR + OR (or chaud/ambré), dark mode only, police moderne sans-serif. (Remplace l'ancienne consigne rouge + serif, rejetée comme "trop ancien".)
- Copier fidèlement la référence visuelle fournie ; le contenu des règles (HP MSSClick) reste inchangé.
- Reproduire fidèlement le contenu du site Google source (toutes les pages/menus déroulants).

## Gotchas

- To refresh/extend content, re-scrape the public Google Site and regenerate `src/data/reglement.ts` (sub-pages are JS-rendered; fetch raw HTML to discover `/view/mssclick-reglement-faction/<group>/<page>` slugs, which contain accents).
- Workflow name is exactly `artifacts/reglement: web`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
