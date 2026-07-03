import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const PROSE_CLASS =
  `prose prose-invert max-w-none
    prose-headings:font-serif prose-headings:text-foreground prose-headings:tracking-tight prose-headings:font-semibold
    prose-h1:text-2xl prose-h2:text-xl prose-h2:text-primary prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-white/10
    prose-h3:text-lg prose-h3:mt-8
    prose-p:text-foreground/75 prose-p:leading-[1.75]
    prose-strong:text-foreground prose-strong:font-semibold
    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
    prose-li:text-foreground/75 prose-li:leading-[1.7] prose-li:marker:text-primary
    prose-blockquote:border-l-2 prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:not-italic prose-blockquote:text-foreground/85 prose-blockquote:font-normal
    prose-hr:border-white/10 prose-hr:my-10`;

export function Prose({
  markdown,
  className,
}: {
  markdown: string;
  className?: string;
}) {
  return (
    <div className={`${PROSE_CLASS} ${className ?? ""}`}>
      <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
    </div>
  );
}
