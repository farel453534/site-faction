---
name: Game DB (bot Postgres) — player stats
description: Schema, guild scoping, and inspection method for the faction's game database used to show a user their réputation + captures.
---

# Game database (bot's Postgres)

Separate from the app's own DB. Connection string in secret `GAME_DATABASE_URL` (Railway Postgres). No SSL required (plain connection works). The bot is **multi-guild**, so every query MUST be scoped by `guild_id`.

- **Faction guild_id = `1062740125475426404`** — the only guild with real reputation/recensement data. Stored in env `DISCORD_GUILD_ID` (default hardcoded as fallback in `game-db.ts`).

## Tables that matter for user stats

- `reputation` (guild_id, user_id, points:int, updated_at, display_name) = **réputation**. `user_id` is the Discord user ID. Some rows use a synthetic `user_id` like `nom:...` (manual, won't match a real login) — fine, they just won't match.
- `recensement` (guild_id, user_id, user_name, date_event, lieu, victime, agresseur, capture_numero, submitted_at, ...) = **captures**. `user_id` = the Discord ID of the **submitter/capturer**. `agresseur` = role/faction name, `victime` = a Discord mention string `<@123…>` (strip it for display), `capture_numero` = a per-guild counter.
- `reputation_history` (guild_id, user_id, delta, new_total, reason, author_id, created_at) = audit log of réputation changes (not yet surfaced).

**Why:** a logged-in Discord user's stats = their own `reputation.points` (rank = count of guild members with strictly more points, +1) and their `recensement` rows, both filtered by the faction guild_id.

## Inspecting the game DB

Root `node -e` can't resolve `pg`. Write a temp `.mjs` in `lib/db/` (that package has `pg`), read `process.env.GAME_DATABASE_URL`, run via `pnpm --filter @workspace/db exec node <file>.mjs`, then delete it.

**How to apply:** any new stat surfaced from this DB goes through `getPlayerStats` in `artifacts/api-server/src/lib/game-db.ts` (singleton read-only pg Pool, parameterized queries) behind the `requireAuth`-protected `GET /api/me/stats`.
