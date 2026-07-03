---
name: Règlement content source & regeneration
description: How the reglement site content is sourced from the public Google Site and where it lives.
---

# Content source for the `reglement` artifact

The site mirrors the public Google Site `https://sites.google.com/view/mssclick-reglement-faction`.
It is a multi-page site: a left sidebar with 4 collapsible groups, each containing sub-pages.

- Groups + sub-page slugs live in `artifacts/reglement/src/data/reglement.ts` (source of truth).
- Only the accueil page is bespoke JSX (`src/pages/Home.tsx`); every other page is cleaned markdown rendered generically by `src/pages/RulePageView.tsx`.

**Why:** the user wanted the FULL site reproduced ("il manque plein de menus déroulants"), not just the one accueil page originally built.

**How to regenerate / extend content:**
- Sub-page nav links are JS-rendered, so `webFetch` markdown of a category page is nearly empty. To discover pages, fetch the RAW HTML (`await fetch(url)`) of any page and regex for `/view/mssclick-reglement-faction/<group>/<page>` — slugs contain accents (é, è), so use a unicode-friendly regex, not `[a-z0-9-]`.
- Then `webFetch` each sub-page for markdown; strip Google Sites boilerplate ("Search this site", "Skip to main content", "Copy heading link" links, "Page updated/Google Sites/Report abuse"), unescape `\-` etc., drop `![](...)` images (Google-hosted, may break).
- The main "Règlement principal" Google Doc is PRIVATE (requires login) — cannot be fetched. The public content is entirely on the Sites pages.

**Conventions:** source-content emojis (faction rank symbols like ☠️⚔️💀) are kept because they carry meaning, even though UI chrome uses no emojis.
