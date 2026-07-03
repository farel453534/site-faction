import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ChevronDown, Feather } from "lucide-react";
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

  const pageLinkCls = (active: boolean) =>
    `group/link relative block py-1.5 pl-4 pr-3 text-[0.92rem] transition-colors ${
      active
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground"
    }`;

  const homeActive = location === "/" || location === "";

  return (
    <div className="flex h-screen w-full bg-background bg-texture overflow-hidden">
      {/* Sidebar — codex index */}
      <aside className="w-72 border-r border-sidebar-border bg-sidebar flex flex-col z-20 shrink-0">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-sidebar-border shrink-0">
          <div className="w-9 h-9 rounded-sm border border-primary/40 bg-primary/5 flex items-center justify-center text-primary shrink-0">
            <Feather className="w-4 h-4" />
          </div>
          <div className="leading-none">
            <div className="font-serif text-[1.35rem] font-bold text-foreground tracking-tight letterpress">
              Règlement
            </div>
            <div className="eyebrow text-[0.7rem] text-primary mt-1">Ministère · Faction</div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <nav className="px-4 py-5">
            <Link
              href="/"
              className={`flex items-center gap-2.5 py-2 pl-2 pr-3 text-sm font-serif transition-colors ${
                homeActive ? "text-primary" : "text-foreground/80 hover:text-primary"
              }`}
            >
              <span
                className={`h-4 w-px ${homeActive ? "bg-primary" : "bg-transparent"}`}
              />
              Accueil — Règlement
            </Link>

            <div className="mt-4 space-y-4">
              {filteredGroups.map((group) => (
                <div key={group.slug}>
                  <button
                    type="button"
                    onClick={() => toggle(group.slug)}
                    className="w-full flex items-center justify-between py-1.5 text-left group/head"
                  >
                    <span className="eyebrow text-[0.72rem] text-foreground/55 group-hover/head:text-primary transition-colors">
                      {group.title}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 shrink-0 transition-transform text-muted-foreground group-hover/head:text-primary ${
                        isOpen(group.slug) ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {isOpen(group.slug) && (
                    <div className="mt-1 border-l border-sidebar-border">
                      {group.pages.map((page) => {
                        const href = `/${group.slug}/${page.slug}`;
                        const active = location === href;
                        return (
                          <Link key={page.slug} href={href} className={pageLinkCls(active)}>
                            <span
                              className={`absolute left-0 top-0 h-full w-px transition-colors ${
                                active
                                  ? "bg-primary"
                                  : "bg-transparent group-hover/link:bg-primary/40"
                              }`}
                            />
                            {page.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {q && filteredGroups.length === 0 && (
              <p className="px-2 py-4 text-sm italic text-muted-foreground">
                Aucune page ne correspond.
              </p>
            )}
          </nav>
        </ScrollArea>

        <div className="border-t border-sidebar-border px-6 py-4 shrink-0">
          <p className="eyebrow text-[0.62rem] text-muted-foreground/70">
            MSSClick · Ministère de la Magie
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 flex flex-col min-w-0 relative bg-vignette">
        {/* Topbar */}
        <header className="h-20 border-b border-border bg-background/85 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
          <div className="hidden md:flex relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="search"
              aria-label="Rechercher une règle"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une règle…"
              className="w-72 bg-transparent border-b border-border rounded-none py-2 pl-9 pr-4 text-sm font-serif focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground/70 placeholder:italic"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-5 border-r border-border pr-6">
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm"
              >
                <FaDiscord className="w-5 h-5" />
                <span className="hidden sm:inline">Discord</span>
              </a>
              <a
                href={MINISTERE_URL}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm"
              >
                <SiRoblox className="w-4 h-4" />
                <span className="hidden sm:inline">Site du Ministère</span>
              </a>
            </div>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer"
              className="border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground px-5 py-2 rounded-sm text-xs font-medium transition-colors uppercase tracking-[0.18em]"
            >
              Se connecter
            </a>
          </div>
        </header>

        {/* Scrollable Area */}
        <ScrollArea className="flex-1 z-10">
          <div className="max-w-3xl mx-auto px-6 py-14 lg:px-8 pb-32">{children}</div>
        </ScrollArea>
      </main>
    </div>
  );
}
