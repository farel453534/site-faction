export type RulePage = { slug: string; title: string; markdown: string };
export type RuleGroup = { slug: string; title: string; pages: RulePage[] };

export type HomeCard = {
  key: string;
  title: string;
  keywords: string;
  markdown: string;
};
export type HomeMeta = { title: string };

export type SiteContent = {
  groups: RuleGroup[];
  home: { meta: HomeMeta; cards: HomeCard[] };
};
