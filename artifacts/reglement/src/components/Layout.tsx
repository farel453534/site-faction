import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  House,
  BookOpen,
  Swords,
  ShieldHalf,
  Sparkles,
  ScrollText,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { FaDiscord, FaXTwitter, FaYoutube, FaTiktok, FaCartShopping } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { ruleGroups } from "@/data/reglement";
import { useSearch } from "@/lib/search-context";
import { useAuth } from "@/lib/use-auth";

const DISCORD_INVITE = "https://discord.gg/TaqPhgNeM4";
const SHOP_URL = "https://mssclick.tebex.io/category/grades";

const groupIcons: Record<string, typeof House> = {
  "notions-de-bases": BookOpen,
  "notions-rpg": Sparkles,
  "notions-pvppve": Swords,
  factions: ShieldHalf,
};

const socials: { icon: IconType; label: string; href: string }[] = [
  { icon: FaCartShopping, label: "Boutique", href: SHOP_URL },
  { icon: FaXTwitter, label: "X", href: DISCORD_INVITE },
  { icon: FaYoutube, label: "YouTube", href: DISCORD_INVITE },
  { icon: FaTiktok, label: "TikTok", href: DISCORD_INVITE },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { query, setQuery } = useSearch();
  const mainRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const flyoutRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  const [openFlyout, setOpenFlyout] = useState<string | null>(null);

  const currentGroupSlug = useMemo(() => {
    const seg = location.split("/").filter(Boolean)[0];
    return ruleGroups.find((g) => g.slug === seg)?.slug ?? null;
  }, [location]);

  const isHome = location === "/" || location === "";

  // Scroll to top on navigation.
  useEffect(() => {
    mainRef.current
      ?.querySelector("[data-radix-scroll-area-viewport]")
      ?.scrollTo({ top: 0, behavior: "smooth" });
    setOpenFlyout(null);
  }, [location]);

  // Close flyout on outside click.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !railRef.current?.contains(target) &&
        !flyoutRef.current?.contains(target)
      ) {
        setOpenFlyout(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const q = query.trim().toLowerCase();
  const searchResults = q
    ? ruleGroups.flatMap((g) =>
        g.pages
          .filter((p) => p.title.toLowerCase().includes(q))
          .map((p) => ({ group: g, page: p })),
      )
    : [];

  const flyoutGroup = ruleGroups.find((g) => g.slug === openFlyout) ?? null;

  return (
    <div className="flex h-screen w-full flex-col bg-stage bg-texture overflow-hidden">
      {/* Topbar (full width) */}
      <header className="h-[68px] shrink-0 flex items-center gap-4 px-4 md:px-6 border-b border-white/5 z-30">
        {/* Emblem */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
            <ScrollText className="w-5 h-5" />
          </div>
          <div className="hidden lg:block leading-tight">
            <div className="font-serif font-extrabold text-foreground text-[0.95rem] tracking-tight">
              RÈGLEMENT
            </div>
            <div className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-primary">
              Faction
            </div>
          </div>
        </Link>

        {/* Search */}
        <div ref={searchRef} className="relative flex-1 max-w-md">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              aria-label="Rechercher une règle"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une règle…"
              className="w-full bg-white/[0.04] border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:bg-white/[0.06] transition-colors"
            />
          </div>
          {q && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-popover border border-popover-border rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-40 max-h-80 overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  Aucune page ne correspond.
                </p>
              ) : (
                searchResults.map(({ group, page }) => (
                  <Link
                    key={`${group.slug}/${page.slug}`}
                    href={`/${group.slug}/${page.slug}`}
                    onClick={() => setQuery("")}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                  >
                    <span className="text-foreground">{page.title}</span>
                    <span className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">
                      {group.title}
                    </span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-2 rounded-full bg-white/[0.05] border border-white/10 px-3.5 py-2 text-sm text-foreground hover:border-primary/50 transition-colors"
          >
            <FaDiscord className="w-4 h-4 text-primary" />
            <span className="hidden md:inline">.gg/mssclick</span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {socials.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                title={label}
                className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors"
              >
                <Icon className="w-[1.05rem] h-[1.05rem]" />
              </a>
            ))}
          </div>

          <AuthButton />
        </div>
      </header>

      {/* Body row: icon rail + main */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Icon rail */}
        <div
          ref={railRef}
          className="w-16 shrink-0 flex flex-col items-center gap-2 py-5 border-r border-white/5 z-30"
        >
          <RailButton
            as="link"
            href="/"
            icon={House}
            label="Accueil"
            active={isHome}
          />
          <div className="h-px w-7 bg-white/10 my-1" />
          {ruleGroups.map((group) => {
            const Icon = groupIcons[group.slug] ?? BookOpen;
            const active = currentGroupSlug === group.slug || openFlyout === group.slug;
            return (
              <RailButton
                key={group.slug}
                as="button"
                icon={Icon}
                label={group.title}
                active={active}
                onClick={() =>
                  setOpenFlyout((cur) => (cur === group.slug ? null : group.slug))
                }
              />
            );
          })}
        </div>

        {/* Flyout panel */}
        {flyoutGroup && (
          <div
            ref={flyoutRef}
            className="absolute left-16 top-0 bottom-0 w-64 bg-popover/95 backdrop-blur-md border-r border-white/10 z-20 animate-in slide-in-from-left-2 fade-in duration-200"
          >
            <div className="px-5 pt-5 pb-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary">
                {flyoutGroup.title}
              </p>
            </div>
            <ScrollArea className="h-[calc(100%-3.5rem)]">
              <nav className="px-3 pb-6 space-y-0.5">
                {flyoutGroup.pages.map((page) => {
                  const href = `/${flyoutGroup.slug}/${page.slug}`;
                  const active = location === href;
                  return (
                    <Link
                      key={page.slug}
                      href={href}
                      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      <span>{page.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    </Link>
                  );
                })}
              </nav>
            </ScrollArea>
          </div>
        )}

        {/* Main content */}
        <main ref={mainRef} className="flex-1 min-w-0">
          <ScrollArea className="h-full">
            <div className="max-w-5xl mx-auto px-5 md:px-10 py-8 md:py-10 pb-32">
              {children}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}

function RailButton({
  as,
  href,
  icon: Icon,
  label,
  active,
  onClick,
}: {
  as: "link" | "button";
  href?: string;
  icon: typeof House;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  const cls = `group relative w-11 h-11 flex items-center justify-center rounded-full transition-colors ${
    active
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:text-primary hover:bg-white/5"
  }`;
  const inner = (
    <>
      <Icon className="w-5 h-5" />
      <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-popover border border-popover-border px-2.5 py-1 text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-50">
        {label}
      </span>
    </>
  );
  if (as === "link" && href) {
    return (
      <Link href={href} className={cls} aria-label={label}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} aria-label={label}>
      {inner}
    </button>
  );
}

function AuthButton() {
  const { user, isLoading, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  if (isLoading) {
    return (
      <div className="w-28 h-9 rounded-full bg-white/[0.05] border border-white/10 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={login}
        className="flex items-center gap-2 rounded-full bg-white/[0.05] border border-white/10 pl-2 pr-4 py-1.5 text-sm text-foreground hover:border-primary/50 transition-colors"
      >
        <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
          <FaDiscord className="w-3.5 h-3.5 text-primary" />
        </span>
        <span className="hidden sm:inline">Se connecter</span>
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full bg-white/[0.05] border border-white/10 pl-1.5 pr-3 py-1.5 text-sm text-foreground hover:border-primary/50 transition-colors"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
            <FaDiscord className="w-3.5 h-3.5 text-primary" />
          </span>
        )}
        <span className="hidden sm:inline max-w-[9rem] truncate">
          {user.displayName}
        </span>
        <ChevronRight
          className={`w-3.5 h-3.5 opacity-50 transition-transform ${
            open ? "rotate-90" : ""
          }`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-popover border border-popover-border rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-40">
          <Link
            href="/profil"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-white/5 transition-colors"
          >
            <User className="w-4 h-4" />
            Mon profil
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-white/5 transition-colors border-t border-white/5"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
