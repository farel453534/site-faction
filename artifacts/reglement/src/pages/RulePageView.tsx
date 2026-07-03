import { useRoute, Link } from "wouter";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { findPage } from "@/data/reglement";
import NotFound from "@/pages/not-found";

export default function RulePageView() {
  const [, params] = useRoute("/:group/:page");
  const result = params ? findPage(params.group, params.page) : null;

  if (!result) return <NotFound />;

  const { group, page } = result;

  return (
    <article className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      <header className="mb-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors mb-3 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{group.title}</span>
        </Link>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          {page.title}
        </h1>
      </header>

      <div
        className="prose prose-invert max-w-none
          prose-headings:font-serif prose-headings:text-foreground prose-headings:tracking-tight prose-headings:font-semibold
          prose-h1:text-2xl prose-h2:text-xl prose-h2:text-primary prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-white/10
          prose-h3:text-lg prose-h3:mt-8
          prose-p:text-foreground/75 prose-p:leading-[1.75]
          prose-strong:text-foreground prose-strong:font-semibold
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-li:text-foreground/75 prose-li:leading-[1.7] prose-li:marker:text-primary
          prose-blockquote:border-l-2 prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:not-italic prose-blockquote:text-foreground/85 prose-blockquote:font-normal
          prose-hr:border-white/10 prose-hr:my-10"
      >
        <Markdown remarkPlugins={[remarkGfm]}>{page.markdown}</Markdown>
      </div>
    </article>
  );
}
