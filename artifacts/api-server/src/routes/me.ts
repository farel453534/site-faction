import { Router, type IRouter } from "express";
import { requireAuth, type AuthedRequest } from "../lib/session";
import { getPlayerStats } from "../lib/game-db";

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

export default router;
