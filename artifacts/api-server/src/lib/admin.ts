import type { Request, Response, NextFunction } from "express";
import { readSession, type AuthedRequest } from "./session";

export function getAdminIds(): Set<string> {
  const raw = process.env["ADMIN_DISCORD_IDS"] ?? "";
  return new Set(
    raw
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  );
}

export function isAdmin(discordId: string): boolean {
  return getAdminIds().has(discordId);
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const user = readSession(req);
  if (!user) {
    res.status(401).json({ authenticated: false });
    return;
  }
  if (!isAdmin(user.id)) {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  (req as AuthedRequest).user = user;
  next();
}
