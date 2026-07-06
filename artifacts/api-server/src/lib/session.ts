import type { Request, Response, NextFunction } from "express";

export const SESSION_COOKIE = "mss_session";

export interface SessionUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  faction: string | null;
  /** Highest grade role held within `faction`, or null if none/no faction. */
  grade: string | null;
  isResponsable: boolean;
  /** Whether this user is part of the general staff (can manage general tickets). */
  isGeneralStaff: boolean;
  /** All factions this user manages as gérant (a user can hold several gérant roles). */
  gerantFactions: string[];
}

export interface AuthedRequest extends Request {
  user?: SessionUser;
}

export function readSession(req: Request): SessionUser | null {
  const raw = req.signedCookies?.[SESSION_COOKIE] as string | undefined;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const user = readSession(req);
  if (!user) {
    res.status(401).json({ authenticated: false });
    return;
  }
  (req as AuthedRequest).user = user;
  next();
}
