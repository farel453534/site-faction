# Règlement Faction — MSSClick Ministère

A dark, atmospheric single-page rules reference site for a Harry Potter roleplay FiveM server faction. Displays the full faction règlement in expandable accordion sections. Theme: black/gray/white/red.

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
- `src/components/Layout.tsx` — shared shell: collapsible left-sidebar nav + topbar + scroll area.
- `src/pages/Home.tsx` — accueil content (intro + 8 hand-styled accordions).
- `src/pages/RulePageView.tsx` — generic markdown page (react-markdown + remark-gfm + tailwind typography).
- `src/data/reglement.ts` — SOURCE OF TRUTH for all sub-page content (4 groups, 23 pages), scraped/cleaned markdown.
- `src/lib/search-context.tsx` — global search state.
- `src/index.css` — theme vars, red palette, fonts (Cormorant Garamond serif), accordion keyframes.

## Architecture decisions

- Content is mirrored from the public Google Site `sites.google.com/view/mssclick-reglement-faction`. Sub-pages are stored as cleaned markdown in `src/data/reglement.ts` and rendered generically; only the accueil page is bespoke JSX.
- Global search (topbar) filters the sidebar nav by page title; on accueil it also filters the accordions — both read the shared SearchContext.
- Source content emojis (faction rank symbols ☠️⚔️ etc.) are kept intact because they carry meaning, despite the general "no emojis in UI chrome" rule.
- Dark mode only; all gold/yellow from the reference replaced with red.

## Product

Single dark, atmospheric rules-reference site (French) for the MSSClick Ministère FiveM faction. Left sidebar navigates 4 rule categories (Notions de Bases, Notions RPG, Notions PVP/PVE, Factions) plus the accueil règlement. Each page shows the faction rules; topbar has search + external links (Discord, Site du Ministère).

## User preferences

- Répondre en français ; l'utilisateur est non-technique.
- Thème noir/gris/blanc/rouge, dark mode only. Remplacer tout or/jaune par du rouge.
- Reproduire fidèlement le contenu du site Google source (toutes les pages/menus déroulants).

## Gotchas

- To refresh/extend content, re-scrape the public Google Site and regenerate `src/data/reglement.ts` (sub-pages are JS-rendered; fetch raw HTML to discover `/view/mssclick-reglement-faction/<group>/<page>` slugs, which contain accents).
- Workflow name is exactly `artifacts/reglement: web`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
