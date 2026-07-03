import { useRoute } from "wouter";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronRight, ScrollText } from "lucide-react";
import { findPage } from "@/data/reglement";
import NotFound from "@/pages/not-found";

export default function RulePageView() {
  const [, params] = useRoute("/:group/:page");
  const result = params ? findPage(params.group, params.page) : null;

  if (!result) return <NotFound />;

  const { group, page } = result;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-primary font-medium tracking-widest mb-4 uppercase">
          <ScrollText className="w-4 h-4" />
          <span>{group.title}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{page.title}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground text-glow tracking-tight">
          {page.title}
        </h1>
      </div>

      <div
        className="prose prose-invert max-w-none
          prose-headings:font-serif prose-headings:text-foreground prose-headings:tracking-wide
          prose-h1:text-3xl prose-h2:text-2xl prose-h2:text-primary prose-h2:mt-10 prose-h3:text-xl
          prose-p:text-muted-foreground prose-p:leading-relaxed
          prose-strong:text-foreground
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-li:text-muted-foreground prose-li:marker:text-primary
          prose-blockquote:border-l-primary prose-blockquote:text-foreground/80
          prose-hr:border-border"
      >
        <Markdown remarkPlugins={[remarkGfm]}>{page.markdown}</Markdown>
      </div>
    </div>
  );
}
