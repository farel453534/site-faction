import { useRoute } from "wouter";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { findPage } from "@/data/reglement";
import NotFound from "@/pages/not-found";

export default function RulePageView() {
  const [, params] = useRoute("/:group/:page");
  const result = params ? findPage(params.group, params.page) : null;

  if (!result) return <NotFound />;

  const { group, page } = result;

  return (
    <article className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      <header className="mb-10">
        <div className="eyebrow text-[0.72rem] text-primary mb-3 flex items-center gap-2">
          <span>{group.title}</span>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-muted-foreground">{page.title}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight letterpress">
          {page.title}
        </h1>
        <div className="mt-5 flex items-center gap-3">
          <span className="h-px w-16 bg-primary" />
          <span className="h-px flex-1 bg-border" />
        </div>
      </header>

      <div
        className="prose prose-invert max-w-none
          prose-headings:font-serif prose-headings:text-foreground prose-headings:tracking-tight prose-headings:font-semibold
          prose-h1:text-3xl prose-h2:text-2xl prose-h2:text-primary prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border
          prose-h3:text-xl prose-h3:mt-8
          prose-p:text-foreground/75 prose-p:leading-[1.75] prose-p:text-[1.02rem]
          prose-strong:text-foreground prose-strong:font-semibold
          prose-a:text-primary prose-a:no-underline prose-a:border-b prose-a:border-primary/40 hover:prose-a:border-primary
          prose-li:text-foreground/75 prose-li:leading-[1.7] prose-li:marker:text-primary
          prose-blockquote:border-l-2 prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:not-italic prose-blockquote:text-foreground/85 prose-blockquote:font-normal
          prose-hr:border-border prose-hr:my-10"
      >
        <Markdown remarkPlugins={[remarkGfm]}>{page.markdown}</Markdown>
      </div>
    </article>
  );
}
