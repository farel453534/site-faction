---
name: Discord OAuth (end-user login) + Railway cross-origin
description: How the custom Discord OAuth login works and the env contract needed when frontend and API live on different Railway domains (Option B).
---

# Custom Discord OAuth end-user login

The Replit Discord connector is owner-level only — it can NOT log in end users. End-user
"Se connecter" is a custom OAuth2 flow in `artifacts/api-server` (Express), consumed by the
`reglement` react-vite site via a `useAuth` React Query hook + `AuthButton` in `Layout.tsx`.

Flow: `/api/auth/discord/login` (signed HttpOnly state cookie → Discord) →
`/api/auth/discord/callback` (verify state, exchange code, fetch user, set signed HttpOnly
session cookie) → `/api/auth/me` (JSON or 401) → `POST /api/auth/logout`. Scope is `identify`.
Session is a signed cookie holding {id, username, global_name, avatar} — no DB, no token stored.
Discord app/client id (public): `1499583925687812137`.

## Same-origin vs cross-origin
- On Replit both artifacts are same-origin (reglement `/`, api `/api`) so `SameSite=lax` + root-relative `/api` works.
- Railway "Option B" = frontend and API on DIFFERENT domains = cross-site. Then:

**Railway env contract (set on the API service):**
- `COOKIE_SAMESITE=none` (else the session cookie is never sent on cross-site fetch)
- `FRONTEND_URL=https://<frontend-domain>` (locks CORS allowlist AND is the post-login redirect target)
- `DISCORD_REDIRECT_URI=https://<api-domain>/api/auth/discord/callback` (must EXACTLY match a URI whitelisted in the Discord dev portal)
- plus secrets `SESSION_SECRET`, `DISCORD_CLIENT_SECRET`

**Frontend build env (reglement):** `VITE_API_URL=https://<api-domain>` so fetch/redirect target the API domain instead of root-relative `/api`.

**Why:** cookies default to `SameSite=lax` and CORS defaults to reflect-any-origin (`origin:true`) only when `FRONTEND_URL` is unset; that combo is unsafe once `SameSite=none` is enabled, so CORS auto-locks to `FRONTEND_URL` when present. Third-party-cookie blocking in some browsers can still break Option B — a single same-origin Railway service (static + `/api`) avoids all of this.

## Option A = same-origin single service (CHOSEN by user, most robust)
One Railway service serves BOTH the built site and `/api`. The Express server (`app.ts`) serves `express.static(STATIC_DIR ?? __dirname/public)` + an SPA fallback (GET/HEAD, non-`/api`, no file extension → `index.html`), mounted AFTER `app.use("/api", router)`. `build.mjs` copies `artifacts/reglement/dist/public` → `artifacts/api-server/dist/public` after esbuild (skipped if the frontend isn't built, so Replit API-only dev is unaffected — the Replit proxy routes only `/api` to the api-server).

**Railway config (single service):** Build = `pnpm install --frozen-lockfile && pnpm --filter @workspace/reglement run build && pnpm --filter @workspace/api-server run build`; Start = `node artifacts/api-server/dist/index.mjs`. Env: `SESSION_SECRET`, `DISCORD_CLIENT_SECRET`, `GAME_DATABASE_URL`, `DISCORD_GUILD_ID=1062740125475426404`, and recommend explicit `DISCORD_REDIRECT_URI=https://<domain>/api/auth/discord/callback` (whitelist the SAME url in the Discord dev portal). Do NOT set `COOKIE_SAMESITE`, `FRONTEND_URL`, or `VITE_API_URL` (same-origin uses lax cookies + root-relative `/api`; `getFrontendUrl`/`getRedirectUri` derive from the request). Railway injects `PORT` automatically.
**Why same-origin is safe:** frontend uses root-relative `/api` (VITE_API_URL unset) so cookies are first-party; `SameSite=lax` survives the top-level OAuth redirect back to `/api/auth/discord/callback`.

`index.ts` fails fast at boot if `SESSION_SECRET` or `DISCORD_CLIENT_SECRET` is missing.
