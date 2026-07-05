import { Router, type IRouter } from "express";
import { requireAuth, type AuthedRequest } from "../lib/session";
import { getPlayerStats } from "../lib/game-db";
import { getUserProfile, updateSteamId } from "../lib/user-profiles";
import { isAppDbConfigured } from "../lib/app-db";

const router: IRouter = Router();

router.get("/me/stats", requireAuth, async (req, res) => {
  const user = (req as AuthedRequest).user;
  if (!user) {
    return res.status(401).json({ authenticated: false });
  }
  try {
    const stats = await getPlayerStats(user.id);
    return res.json(stats);
  } catch (err) {
    req.log.error({ err }, "Failed to load player stats");
    return res.status(502).json({ error: "stats_unavailable" });
  }
});

/** GET /api/me/profile — returns the stored panel profile (incl. steamId). */
router.get("/me/profile", requireAuth, async (req, res) => {
  const user = (req as AuthedRequest).user!;
  if (!isAppDbConfigured()) {
    return res.json({ steamId: null, dbConfigured: false });
  }
  try {
    const profile = await getUserProfile(user.id);
    return res.json({ steamId: profile?.steamId ?? null, dbConfigured: true });
  } catch (err) {
    req.log.error({ err }, "Failed to load user profile");
    return res.status(500).json({ error: "internal_error" });
  }
});

/**
 * Normalise un Steam ID vers le format texte STEAM_1:Y:Z.
 * Accepte :
 *   - Format texte  : STEAM_X:Y:Z  (ex. STEAM_1:1:36048523)
 *   - SteamID32     : nombre ≤ 10 chiffres  (ex. 72097047)
 *   - SteamID64     : exactement 17 chiffres (ex. 76561198032362775)
 * Retourne null si la valeur est invalide.
 */
function normalizeSteamId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const STEAM_ID64_BASE = 76561197960265728n;

  function toSteamText(id64: bigint): string {
    const diff = id64 - STEAM_ID64_BASE;
    const y = diff % 2n;
    const z = (diff - y) / 2n;
    return `STEAM_1:${y}:${z}`;
  }

  // Format texte STEAM_X:Y:Z (case-insensitive, Y ∈ {0,1}, Z ≤ 2^31−1)
  const textMatch = /^STEAM_\d+:([01]):(\d{1,10})$/i.exec(trimmed);
  if (textMatch) {
    const y = BigInt(textMatch[1]!);
    const z = BigInt(textMatch[2]!);
    if (z > 2147483647n) return null;
    return `STEAM_1:${y}:${z}`;
  }

  // SteamID64 : exactement 17 chiffres
  if (/^\d{17}$/.test(trimmed)) {
    const id64 = BigInt(trimmed);
    if (id64 < STEAM_ID64_BASE) return null;
    return toSteamText(id64);
  }

  // SteamID32 : 1 à 10 chiffres, max 4294967295 (2^32−1)
  if (/^\d{1,10}$/.test(trimmed)) {
    const id32 = BigInt(trimmed);
    if (id32 > 4294967295n) return null;
    return toSteamText(STEAM_ID64_BASE + id32);
  }

  return null;
}

/** PATCH /api/me/profile — update steamId (accepte SteamID32 ou SteamID64). */
router.patch("/me/profile", requireAuth, async (req, res) => {
  const user = (req as AuthedRequest).user!;
  if (!isAppDbConfigured()) {
    return res.status(503).json({ error: "db_unavailable" });
  }
  const body = req.body as { steamId?: unknown };
  const rawSteamId = typeof body.steamId === "string" ? body.steamId.trim() : null;

  let steamId64: string | null = null;
  if (rawSteamId) {
    steamId64 = normalizeSteamId(rawSteamId);
    if (!steamId64) {
      return res.status(400).json({ error: "invalid_steam_id" });
    }
  }

  try {
    await updateSteamId(user.id, steamId64 || null, {
      username:    user.username,
      global_name: user.global_name,
      avatar:      user.avatar,
      faction:     user.faction,
    });
    return res.json({ ok: true, steamId: steamId64 || null });
  } catch (err) {
    if (err instanceof Error && err.message === "DB_UNAVAILABLE") {
      return res.status(503).json({ error: "db_unavailable" });
    }
    req.log.error({ err }, "Failed to update steam ID");
    return res.status(500).json({ error: "internal_error" });
  }
});

export default router;
