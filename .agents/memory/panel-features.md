---
name: Panel user registry + blacklist
description: user_profiles table tracks all Discord logins + steamId; blacklists table is per-faction gérant-scoped; auth blocks non-guild members.
---

## user_profiles table
Upserted on every Discord OAuth callback (fire-and-forget, never blocks login).
Columns: discordId (PK), username, globalName, avatar, faction, steamId, firstSeenAt, lastSeenAt.

**Why:** Admin "Membres connectés" tab and per-member steamId display for gérants both require a persistent panel-side user store separate from the session cookie.

## steamId flow
- User sets via PATCH /api/me/profile → `updateSteamId(id, value, sessionUser)`.
- Always upserts (insert-on-conflict) so a missing profile row never silently discards the save.
- Gérant member list reads steamIds in bulk via `getSteamIds(discordIds[])` on the gerant/members route.

## blacklists table
Columns: id, faction, discordId, playerName, reason, addedBy, addedByUsername, createdAt.
Routes: GET/POST/DELETE /api/gerant/blacklist — all enforced via `user.gerantFactions.includes(faction)`.
Delete: fetches row first to verify faction ownership before deleting (prevents cross-faction delete).

**Why:** Each gérant must only see/manage their own faction's blacklist.

## Guild-member gate (auth.ts)
fetchDiscordGuildMember returns null for 404/403 (not in guild) and throws for real API failures.
Removed .catch(() => null) wrapper — real errors now bubble to outer catch → redirect ?login=error, not the misleading ?login=not_member.
Non-members get ?login=not_member → toast "Tu dois être membre du Discord MSSClick".

## DB libs typecheck note
lib/db is a composite TS project (emitDeclarationOnly). After adding a new schema file, run `pnpm run typecheck:libs` from root before typechecking artifacts — otherwise new exports aren't in dist/.

## Replit dev vs Railway
DISCORD_CLIENT_SECRET / DISCORD_CLIENT_ID live on Railway only. API Server workflow will always fail in Replit dev. Frontend (Règlement Faction workflow) runs fine and connects to Railway API via VITE_API_URL.
