---
name: Editable content overlay
description: How admin-editable site content works and the seed-corruption pitfall.
---

# Editable site content (admin editor)

Content is a static seed in `lib/content` (`@workspace/content`) overlaid at runtime by
DB rows. The server merges them in `getContent()` (api-server `lib/content-db.ts`);
frontend uses `useContent()` with the static seed as `placeholderData` so the site
renders instantly and still works with no DB (editing then 503s).

- Overlay tables (`lib/db`): `content_groups`, `content_pages` (composite PK
  group+page), `content_home_cards`, `content_settings` (home title under key
  `home.title`). A row exists only for an item an admin edited; reset = delete the row.
- Public read: `GET /api/content`. Admin writes: `PUT/DELETE /api/admin/content/{group/:g, page/:g/:p, home/meta, home/card/:key}` (requireAdmin, 503 if no DB).

## Pitfall: never return the shared seed object from defaultContent()
`defaultContent()` MUST deep-copy the module-level seed (uses `JSON.parse(JSON.stringify)`).
**Why:** `getContent()` overlays edits by mutating `page.title`/`markdown` in place. If
`defaultContent()` returned the shared `ruleGroups` reference, the first overlay would
permanently corrupt the in-memory seed for the whole process — edits appeared "frozen"
and survived DB deletes. Symptom to watch for: GET returns a stale edited value even
though the DB row is gone.
