import { ruleGroups } from "./rules";
import { homeCards, homeMeta } from "./home";
import type { RuleGroup, RulePage, SiteContent } from "./types";

export * from "./types";
export { ruleGroups } from "./rules";
export { homeCards, homeMeta } from "./home";

export function findPage(
  groups: RuleGroup[],
  groupSlug: string,
  pageSlug: string,
): { group: RuleGroup; page: RulePage } | null {
  const group = groups.find((g) => g.slug === groupSlug);
  if (!group) return null;
  const page = group.pages.find((p) => p.slug === pageSlug);
  if (!page) return null;
  return { group, page };
}

// Returns a fresh deep copy every call. Callers (e.g. the server overlay) mutate
// the returned object in place, so it must NOT share references with the module-level
// seed — otherwise those edits would permanently corrupt the static fallback.
export function defaultContent(): SiteContent {
  return JSON.parse(
    JSON.stringify({
      groups: ruleGroups,
      home: { meta: homeMeta, cards: homeCards },
    }),
  ) as SiteContent;
}
