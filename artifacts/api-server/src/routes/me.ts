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
 * Normalise un Steam ID vers le format 64-bit (17 chiffres).
 * Accepte SteamID64 (17 chiffres) ou SteamID32 (≤10 chiffres).
 * Retourne null si la valeur est invalide.
 */
function normalizeSteamId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // SteamID64 : exactement 17 chiffres
  if (/^\d{17}$/.test(trimmed)) return trimmed;
  // SteamID32 : 1 à 10 chiffres, max valeur 4294967295 (2^32 − 1) → conversion en SteamID64
  if (/^\d{1,10}$/.test(trimmed)) {
    const id32 = BigInt(trimmed);
    if (id32 > 4294967295n) return null; // hors plage valide
    const STEAM_ID64_BASE = 76561197960265728n;
    return (STEAM_ID64_BASE + id32).toString();
  }
  return null; // invalide
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
