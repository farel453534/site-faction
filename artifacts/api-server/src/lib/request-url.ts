import type { Request } from "express";

/** Reconstructs the public base URL (scheme+host) the request came in on, honoring proxy headers. */
export function getBaseUrl(req: Request): string {
  const proto =
    (req.headers["x-forwarded-proto"] as string | undefined)
      ?.split(",")[0]
      ?.trim() || req.protocol;
  const host =
    (req.headers["x-forwarded-host"] as string | undefined)
      ?.split(",")[0]
      ?.trim() || req.get("host");
  return `${proto}://${host}`;
}

/** Builds a deep link to a ticket on the frontend (opens it directly via ?id=). */
export function buildTicketUrl(req: Request, ticketId: number): string {
  const base = process.env["FRONTEND_URL"] ?? `${getBaseUrl(req)}/`;
  const url = new URL("tickets", base);
  url.searchParams.set("id", String(ticketId));
  return url.toString();
}
