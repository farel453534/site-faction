import { Router, type IRouter } from "express";
import { requireAdmin } from "../lib/admin";
import { isAppDbConfigured } from "../lib/app-db";
import {
  getContent,
  updateGroup,
  updatePage,
  updateHomeCard,
  updateHomeTitle,
  resetGroup,
  resetPage,
  resetHomeCard,
  resetHomeTitle,
} from "../lib/content-db";
import type { AuthedRequest } from "../lib/session";

const router: IRouter = Router();

const SLUG_RE = /^[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*$/u;
const MAX_TITLE = 300;
const MAX_MD = 60_000;

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function editor(req: unknown): string {
  return (req as AuthedRequest).user?.id ?? "unknown";
}

function guardDb(res: import("express").Response): boolean {
  if (!isAppDbConfigured()) {
    res.status(503).json({ error: "db_unavailable" });
    return false;
  }
  return true;
}

// Public: full site content (static seed + admin overlay).
router.get("/content", async (req, res) => {
  try {
    const content = await getContent();
    res.json(content);
  } catch (err) {
    req.log.error({ err }, "Failed to load content");
    res.status(500).json({ error: "internal_error" });
  }
});

router.put("/admin/content/home/meta", requireAdmin, async (req, res) => {
  if (!guardDb(res)) return;
  const title = str((req.body as { title?: unknown }).title).trim();
  if (!title || title.length > MAX_TITLE) {
    res.status(400).json({ error: "invalid_title" });
    return;
  }
  try {
    await updateHomeTitle(title, editor(req));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update home title");
    res.status(500).json({ error: "internal_error" });
  }
});

router.delete("/admin/content/home/meta", requireAdmin, async (req, res) => {
  if (!guardDb(res)) return;
  try {
    await resetHomeTitle();
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to reset home title");
    res.status(500).json({ error: "internal_error" });
  }
});

router.put("/admin/content/home/card/:key", requireAdmin, async (req, res) => {
  if (!guardDb(res)) return;
  const key = str(req.params["key"]);
  if (!SLUG_RE.test(key)) {
    res.status(400).json({ error: "invalid_key" });
    return;
  }
  const body = req.body as {
    title?: unknown;
    keywords?: unknown;
    markdown?: unknown;
  };
  const title = str(body.title).trim();
  const keywords = str(body.keywords).trim();
  const markdown = str(body.markdown);
  if (!title || title.length > MAX_TITLE) {
    res.status(400).json({ error: "invalid_title" });
    return;
  }
  if (markdown.length > MAX_MD) {
    res.status(400).json({ error: "invalid_markdown" });
    return;
  }
  try {
    await updateHomeCard(key, title, keywords, markdown, editor(req));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update home card");
    res.status(500).json({ error: "internal_error" });
  }
});

router.delete(
  "/admin/content/home/card/:key",
  requireAdmin,
  async (req, res) => {
    if (!guardDb(res)) return;
    const key = str(req.params["key"]);
    if (!SLUG_RE.test(key)) {
      res.status(400).json({ error: "invalid_key" });
      return;
    }
    try {
      await resetHomeCard(key);
      res.json({ ok: true });
    } catch (err) {
      req.log.error({ err }, "Failed to reset home card");
      res.status(500).json({ error: "internal_error" });
    }
  },
);

router.put("/admin/content/group/:group", requireAdmin, async (req, res) => {
  if (!guardDb(res)) return;
  const group = str(req.params["group"]);
  if (!SLUG_RE.test(group)) {
    res.status(400).json({ error: "invalid_slug" });
    return;
  }
  const title = str((req.body as { title?: unknown }).title).trim();
  if (!title || title.length > MAX_TITLE) {
    res.status(400).json({ error: "invalid_title" });
    return;
  }
  try {
    await updateGroup(group, title, editor(req));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to update group");
    res.status(500).json({ error: "internal_error" });
  }
});

router.delete("/admin/content/group/:group", requireAdmin, async (req, res) => {
  if (!guardDb(res)) return;
  const group = str(req.params["group"]);
  if (!SLUG_RE.test(group)) {
    res.status(400).json({ error: "invalid_slug" });
    return;
  }
  try {
    await resetGroup(group);
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to reset group");
    res.status(500).json({ error: "internal_error" });
  }
});

router.put(
  "/admin/content/page/:group/:page",
  requireAdmin,
  async (req, res) => {
    if (!guardDb(res)) return;
    const group = str(req.params["group"]);
    const page = str(req.params["page"]);
    if (!SLUG_RE.test(group) || !SLUG_RE.test(page)) {
      res.status(400).json({ error: "invalid_slug" });
      return;
    }
    const body = req.body as { title?: unknown; markdown?: unknown };
    const title = str(body.title).trim();
    const markdown = str(body.markdown);
    if (!title || title.length > MAX_TITLE) {
      res.status(400).json({ error: "invalid_title" });
      return;
    }
    if (markdown.length > MAX_MD) {
      res.status(400).json({ error: "invalid_markdown" });
      return;
    }
    try {
      await updatePage(group, page, title, markdown, editor(req));
      res.json({ ok: true });
    } catch (err) {
      req.log.error({ err }, "Failed to update page");
      res.status(500).json({ error: "internal_error" });
    }
  },
);

router.delete(
  "/admin/content/page/:group/:page",
  requireAdmin,
  async (req, res) => {
    if (!guardDb(res)) return;
    const group = str(req.params["group"]);
    const page = str(req.params["page"]);
    if (!SLUG_RE.test(group) || !SLUG_RE.test(page)) {
      res.status(400).json({ error: "invalid_slug" });
      return;
    }
    try {
      await resetPage(group, page);
      res.json({ ok: true });
    } catch (err) {
      req.log.error({ err }, "Failed to reset page");
      res.status(500).json({ error: "internal_error" });
    }
  },
);

export default router;
