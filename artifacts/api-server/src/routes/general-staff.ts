import { Router, type IRouter } from "express";
import { requireAuth, type AuthedRequest } from "../lib/session";
import { isAppDbConfigured } from "../lib/app-db";
import {
  listGeneralStaff,
  addGeneralStaff,
  removeGeneralStaff,
} from "../lib/general-staff";

const router: IRouter = Router();
const ID_RE = /^\d{15,25}$/;

function requireResponsable(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction,
) {
  requireAuth(req, res, () => {
    const user = (req as AuthedRequest).user!;
    if (!user.isResponsable) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    next();
  });
}

router.get("/general-staff", requireResponsable, async (req, res) => {
  try {
    const staff = await listGeneralStaff();
    res.json({
      staff: staff.map((s) => ({
        discordId: s.discordId,
        label: s.label,
        addedBy: s.addedBy,
        createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : null,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list general staff");
    res.status(500).json({ error: "internal_error" });
  }
});

router.post("/general-staff", requireResponsable, async (req, res) => {
  if (!isAppDbConfigured()) {
    res.status(503).json({ error: "db_unavailable" });
    return;
  }
  const body = req.body as { discordId?: unknown; label?: unknown };
  const discordId =
    typeof body.discordId === "string" ? body.discordId.trim() : "";
  const label =
    typeof body.label === "string" && body.label.trim()
      ? body.label.trim().slice(0, 60)
      : null;
  if (!ID_RE.test(discordId)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  try {
    await addGeneralStaff(
      discordId,
      label,
      (req as AuthedRequest).user?.id ?? "unknown",
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "DB_UNAVAILABLE") {
      res.status(503).json({ error: "db_unavailable" });
      return;
    }
    req.log.error({ err }, "Failed to add general staff");
    res.status(500).json({ error: "internal_error" });
  }
});

router.delete("/general-staff/:discordId", requireResponsable, async (req, res) => {
  if (!isAppDbConfigured()) {
    res.status(503).json({ error: "db_unavailable" });
    return;
  }
  const discordId = String(req.params["discordId"] ?? "");
  if (!ID_RE.test(discordId)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  try {
    await removeGeneralStaff(discordId);
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "DB_UNAVAILABLE") {
      res.status(503).json({ error: "db_unavailable" });
      return;
    }
    req.log.error({ err }, "Failed to remove general staff");
    res.status(500).json({ error: "internal_error" });
  }
});

export default router;
