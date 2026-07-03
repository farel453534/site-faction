import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ChevronDown, BookOpen, ScrollText } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import { SiRoblox } from "react-icons/si";
import { ruleGroups } from "@/data/reglement";
import { useSearch } from "@/lib/search-context";

const DISCORD_URL = "https://discord.gg/mssclick";
const MINISTERE_URL = "https://sites.google.com/view/ministeremssclick/accueil";

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { query, setQuery } = useSearch();
  const mainRef = useRef<HTMLElement | null>(null);

  const q = query.trim().toLowerCase();

  const currentGroupSlug = useMemo(() => {
    const seg = location.split("/").filter(Boolean)[0];
    return ruleGroups.find((g) => g.slug === seg)?.slug ?? null;
  }, [location]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Auto-open the group of the current page.
  useEffect(() => {
    if (currentGroupSlug) {
      setOpenGroups((prev) => ({ ...prev, [currentGroupSlug]: true }));
    }
  }, [currentGroupSlug]);

  // Scroll to top on navigation.
  useEffect(() => {
    mainRef.current
      ?.querySelector("[data-radix-scroll-area-viewport]")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  const filteredGroups = ruleGroups
    .map((g) => {
      if (!q) return g;
      const groupMatch = g.title.toLowerCase().includes(q);
      return {
        ...g,
        pages: groupMatch
          ? g.pages
          : g.pages.filter((p) => p.title.toLowerCase().includes(q)),
      };
    })
    .filter((g) => !q || g.pages.length > 0);

  const isOpen = (slug: string) =>
    q ? true : openGroups[slug] ?? slug === currentGroupSlug;

  const toggle = (slug: string) =>
    setOpenGroups((prev) => ({ ...prev, [slug]: !isOpen(slug) }));

  const linkCls = (active: boolean) =>
    `block rounded-md px-3 py-2 text-sm transition-colors ${
      active
        ? "bg-primary/10 text-primary font-semibold"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
    }`;

  return (
    <div className="flex h-screen w-full bg-background bg-texture overflow-hidden selection:bg-primary/30 selection:text-primary">
      {/* Sidebar */}
      <aside className="w-72 border-r border-border bg-sidebar flex flex-col z-20 shrink-0">
        <div className="h-20 flex items-center gap-3 px-5 border-b border-border shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary red-glow shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-lg font-bold text-foreground">Règlement</div>
            <div className="text-xs uppercase tracking-widest text-primary">Faction</div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <nav className="p-3 space-y-1">
            <Link href="/" className={linkCls(location === "/" || location === "")}>
              <span className="flex items-center gap-2">
                <ScrollText className="w-4 h-4" />
                Accueil
              </span>
            </Link>

            {filteredGroups.map((group) => (
              <div key={group.slug} className="pt-1">
                <button
                  type="button"
                  onClick={() => toggle(group.slug)}
                  className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wider text-foreground/80 hover:text-primary hover:bg-secondary/40 transition-colors"
                >
                  <span>{group.title}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isOpen(group.slug) ? "rotate-180 text-primary" : ""}`}
                  />
                </button>
                {isOpen(group.slug) && (
                  <div className="mt-1 ml-3 border-l border-border pl-2 space-y-0.5">
                    {group.pages.map((page) => {
                      const href = `/${group.slug}/${page.slug}`;
                      return (
                        <Link key={page.slug} href={href} className={linkCls(location === href)}>
                          {page.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {q && filteredGroups.length === 0 && (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                Aucune page ne correspond.
              </p>
            )}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 flex flex-col min-w-0 relative">
        {/* Background gradient effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-red-900/10 blur-[150px] rounded-full" />
        </div>

        {/* Topbar */}
        <header className="h-20 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
          <div className="hidden md:flex relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une règle..."
              className="w-64 bg-secondary/50 border border-border rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-border pr-6">
              <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium">
                <FaDiscord className="w-5 h-5" />
                <span className="hidden sm:inline">Discord</span>
              </a>
              <a href={MINISTERE_URL} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium">
                <SiRoblox className="w-4 h-4" />
                <span className="hidden sm:inline">Site du Ministère</span>
              </a>
            </div>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground px-6 py-2 rounded-md text-sm font-semibold transition-all red-glow uppercase tracking-wider">
              Se connecter
            </a>
          </div>
        </header>

        {/* Scrollable Area */}
        <ScrollArea className="flex-1 z-10">
          <div className="max-w-4xl mx-auto px-6 py-12 lg:px-8 pb-32">{children}</div>
        </ScrollArea>
      </main>
    </div>
  );
}
