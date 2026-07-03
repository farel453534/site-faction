---
name: Admin access model (Étape 1)
description: How site admins are designated and what the first admin surface exposes, plus the staged roadmap for admin powers.
---

# Admin access — staged roadmap

The user (non-technical, French) wants three admin powers, built in ordered steps:
1. **Étape 1 (DONE):** view ALL players' stats (réputation leaderboard + captures) + admin gating.
2. **Étape 2 (not started):** app's OWN Postgres on Railway (`DATABASE_URL`) → manage/designate admins from the site (needs a new Railway Postgres service the user must add).
3. **Étape 3 (not started, biggest):** in-site règlement editor (CMS). Requires moving content out of the static `src/data/reglement.ts` into the DB.

The user also picked "Autre chose" as a 4th power but has NOT yet said what it is — ask before Étape 2/3.

## Étape 1 admin model — env var, no DB

Admins are designated by **`ADMIN_DISCORD_IDS`** (comma/space-separated Discord user IDs), read at request time by `isAdmin()`/`requireAdmin()` (`api-server/src/lib/admin.ts`). No DB needed for Étape 1 — deliberately, so it ships before the Railway app-DB work.

**Why env var:** persistent admin management from the site needs the app's own DB, which prod doesn't have yet. Env var is the zero-infra bridge.

**How to apply / deploy:**
- `ADMIN_DISCORD_IDS` MUST be set on the **Railway** service (same-origin app), or nobody is admin in prod. It is NOT auto-set — the user provides their Discord ID (Discord → Advanced → Developer Mode → right-click profile → Copy ID).
- Gating is enforced server-side (`requireAdmin` on `/api/admin/*`), not just in the UI. `/api/auth/me` returns `isAdmin` so the frontend shows the "Administration" nav link + `/admin` page.
- Admin surface: `GET /api/admin/players` (leaderboard) and `GET /api/admin/player?userId=` (per-player detail, reuses `getPlayerStats`). userId passed as a query param (not a path param) because reputation IDs can be synthetic `nom:...` with spaces/colons.
