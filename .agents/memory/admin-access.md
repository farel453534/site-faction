---
name: Admin access model (Étape 1)
description: How site admins are designated and what the first admin surface exposes, plus the staged roadmap for admin powers.
---

# Admin access — staged roadmap

The user (non-technical, French) wants three admin powers, built in ordered steps:
1. **Étape 1 (DONE):** view ALL players' stats (réputation leaderboard + captures) + admin gating.
2. **Étape 2 (DONE):** app's OWN Postgres → manage/designate admins from the site. See "Étape 2" section below.
3. **Étape 3 (not started, biggest):** in-site règlement editor (CMS). Requires moving content out of the static `src/data/reglement.ts` into the DB.

The user also picked "Autre chose" as a 4th power but has NOT yet said what it is — ask before Étape 2/3.

## Étape 1 admin model — env var, no DB

Admins are designated by **`ADMIN_DISCORD_IDS`** (comma/space-separated Discord user IDs), read at request time by `isAdmin()`/`requireAdmin()` (`api-server/src/lib/admin.ts`). No DB needed for Étape 1 — deliberately, so it ships before the Railway app-DB work.

**Why env var:** persistent admin management from the site needs the app's own DB, which prod doesn't have yet. Env var is the zero-infra bridge.

**How to apply / deploy:**
- `ADMIN_DISCORD_IDS` MUST be set on the **Railway** service (same-origin app), or nobody is admin in prod. It is NOT auto-set — the user provides their Discord ID (Discord → Advanced → Developer Mode → right-click profile → Copy ID).
- Gating is enforced server-side (`requireAdmin` on `/api/admin/*`), not just in the UI. `/api/auth/me` returns `isAdmin` so the frontend shows the "Administration" nav link + `/admin` page.
- Admin surface: `GET /api/admin/players` (leaderboard) and `GET /api/admin/player?userId=` (per-player detail, reuses `getPlayerStats`). userId passed as a query param (not a path param) because reputation IDs can be synthetic `nom:...` with spaces/colons.

## Étape 2 — DB-backed admin management (DONE)

Admins can now add/remove other admins from the site. Two-tier model:
- **Env bootstrap superadmins** (`ADMIN_DISCORD_IDS`): always admin, shown as "Principal", NOT removable via UI (returns `env_admin_protected`). Prevents lockout and works even with no DB.
- **DB admins**: `admins` table in `lib/db` (discord_id PK, label, added_by, created_at). Added/removed via UI.

`isAdmin()` is now **async** (env OR DB), which forced `requireAdmin` and `/auth/me` async too.

**CRITICAL no-DB-boot rule:** `lib/db/src/index.ts` (root `@workspace/db`) THROWS at import if `DATABASE_URL` is unset. So api-server must NOT import root `@workspace/db`. Instead: import table/types from the safe subpath `@workspace/db/schema`, and use a lazy tolerant client `api-server/src/lib/app-db.ts` (`getAppDb()` returns null when no `DATABASE_URL`; `isAppDbConfigured()`). This lets the Railway app boot before a Postgres is provisioned; admin-mgmt UI degrades gracefully (`dbConfigured:false`).
**Why:** prod Railway had no app DB at build time; an eager import would crash the whole live site.

Endpoints (all `requireAdmin`): `GET/POST /api/admin/admins`, `DELETE /api/admin/admins/:discordId`. ID validated `^\d{15,25}$`. Frontend: tabs on `/admin` page (Joueurs | Administrateurs), hooks `useAdminList/useAddAdmin/useRemoveAdmin`.

**Prod deploy for Étape 2:** user must add a Railway Postgres service + set `DATABASE_URL`, then push schema (`pnpm --filter @workspace/db run push`) against the prod DB. Until then, prod runs env-only admins (no crash).
