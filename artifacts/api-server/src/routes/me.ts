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

/** PATCH /api/me/profile — update steamId. */
router.patch("/me/profile", requireAuth, async (req, res) => {
  const user = (req as AuthedRequest).user!;
  if (!isAppDbConfigured()) {
    return res.status(503).json({ error: "db_unavailable" });
  }
  const body = req.body as { steamId?: unknown };
  const rawSteamId = typeof body.steamId === "string" ? body.steamId.trim() : null;
  // Validate: Steam ID is a 64-bit number (17 digits starting with 7656119)
  if (rawSteamId && !/^\d{17}$/.test(rawSteamId)) {
    return res.status(400).json({ error: "invalid_steam_id" });
  }
  try {
    await updateSteamId(user.id, rawSteamId || null, {
      username:    user.username,
      global_name: user.global_name,
      avatar:      user.avatar,
      faction:     user.faction,
    });
    return res.json({ ok: true, steamId: rawSteamId || null });
  } catch (err) {
    if (err instanceof Error && err.message === "DB_UNAVAILABLE") {
      return res.status(503).json({ error: "db_unavailable" });
    }
    req.log.error({ err }, "Failed to update steam ID");
    return res.status(500).json({ error: "internal_error" });
  }
});

export default router;
