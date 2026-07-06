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
  ChevronRight,
  ChevronsRight,
  LogOut,
  User,
  ShieldCheck,
  KeyRound,
  Ticket,
  ScrollText,
  BookMarked,
  Library,
} from "lucide-react";
import { FaDiscord, FaXTwitter, FaYoutube, FaTiktok, FaCartShopping } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { useSearch } from "@/lib/search-context";
import { useAuth, useTicketBadgeCount } from "@/lib/use-auth";
import { useContent } from "@/lib/use-content";

const DISCORD_INVITE = "https://discord.gg/TaqPhgNeM4";
const SHOP_URL = "https://mssclick.tebex.io/category/grades";
const WIKI_BASE = "https://mssclick-poudlard.gitbook.io/wiki";

const LORES = [
  { label: "Auror", slug: "auror" },
  { label: "Mangemort", slug: "mangemort" },
  { label: "Vampire", slug: "vampire" },
  { label: "Ministère", slug: "ministere" },
  { label: "Lycanthrope", slug: "lycanthrope" },
];

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
  const { data: content } = useContent();
  const { user, isAdmin } = useAuth();
  const ruleGroups = content?.groups ?? [];
  const mainRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const flyoutRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  const [openFlyout, setOpenFlyout] = useState<string | null>(null);

  const currentGroupSlug = useMemo(() => {
    const seg = location.split("/").filter(Boolean)[0];
    return ruleGroups.find((g) => g.slug === seg)?.slug ?? null;
  }, [location, ruleGroups]);

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

  type SearchItem = {
    key: string;
    title: string;
    subtitle: string;
    href: string;
    external?: boolean;
  };

  const allSearchItems = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [];

    // Pages de règles
    for (const g of ruleGroups) {
      for (const p of g.pages) {
        items.push({
          key: `rule:${g.slug}/${p.slug}`,
          title: p.title,
          subtitle: g.title,
          href: `/${g.slug}/${p.slug}`,
        });
      }
    }

    // Navigation principale (toujours visible)
    items.push({ key: "nav:accueil", title: "Accueil", subtitle: "Navigation", href: "/" });
    items.push({ key: "nav:reglement", title: "Règlement", subtitle: "Navigation", href: "/reglement" });
    items.push({ key: "nav:wiki", title: "Wiki", subtitle: "Lien externe", href: WIKI_BASE, external: true });

    // Pages liées au compte
    if (user) {
      items.push({ key: "nav:profil", title: "Mon profil", subtitle: "Mon compte", href: "/profil" });
      items.push({ key: "nav:tickets", title: "Tickets", subtitle: "Mon compte", href: "/tickets" });
    }
    if (user && user.gerantFactions.length > 0) {
      items.push({ key: "nav:gerant", title: "Gérer ma faction", subtitle: "Mon compte", href: "/gerant" });
    }
    if (isAdmin) {
      items.push({ key: "nav:admin", title: "Administration", subtitle: "Mon compte", href: "/admin" });
    }

    // Lores
    for (const lore of LORES) {
      items.push({
        key: `lore:${lore.slug}`,
        title: `Lore ${lore.label}`,
        subtitle: "Lores — Factions",
        href: `${WIKI_BASE}/lore-faction/${lore.slug}`,
        external: true,
      });
    }

    return items;
  }, [ruleGroups, user, isAdmin]);

  const searchResults = q
    ? allSearchItems.filter((item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q),
      )
    : [];

  const flyoutGroup = ruleGroups.find((g) => g.slug === openFlyout) ?? null;

  return (
    <div className="flex h-screen w-full flex-col bg-[#070707] overflow-hidden">
      {/* Topbar (full width) */}
      <header className="h-[68px] shrink-0 flex items-center gap-4 px-4 md:px-6 border-b border-white/5 z-30">
        {/* Emblem */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <img
            src={`${import.meta.env.BASE_URL}favicon.png`}
            alt="MSSClick"
            className="w-[54px] h-[54px] object-contain"
          />
          <div className="hidden lg:block leading-tight">
            <div className="font-serif font-extrabold text-foreground text-[1.45rem] tracking-tight uppercase">
              MSSClick
            </div>
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-primary">
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
              aria-label="Rechercher"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="w-full bg-white/[0.04] border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:bg-white/[0.06] transition-colors"
            />
          </div>
          {q && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-popover border border-popover-border rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-40 max-h-80 overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  Aucun résultat pour « {query} ».
                </p>
              ) : (
                searchResults.map((item) =>
                  item.external ? (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setQuery("")}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                    >
                      <span className="text-foreground">{item.title}</span>
                      <span className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">
                        {item.subtitle}
                      </span>
                    </a>
                  ) : (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setQuery("")}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                    >
                      <span className="text-foreground">{item.title}</span>
                      <span className="text-[0.68rem] uppercase tracking-wider text-muted-foreground">
                        {item.subtitle}
                      </span>
                    </Link>
                  )
                )
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          <a
            href="https://mssclick-poudlard.gitbook.io/wiki"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-2 rounded-full bg-white/[0.05] border border-white/10 px-3.5 py-2 text-sm text-foreground hover:border-primary/50 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="hidden md:inline">Wiki</span>
          </a>
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
          className="w-[76px] shrink-0 flex flex-col items-center gap-2.5 py-5 border-r border-white/5 z-30"
        >
          {/* Accueil */}
          <RailButton
            as="link"
            href="/"
            icon={House}
            label="Accueil"
            active={isHome}
          />
          {/* Règlement spécifique au RP */}
          <RailButton
            as="link"
            href="/reglement"
            icon={ScrollText}
            label="Règlement"
            active={location === "/reglement"}
          />
          {/* Wiki externe */}
          <RailButton
            as="a"
            href="https://mssclick-poudlard.gitbook.io/wiki"
            icon={BookMarked}
            label="Wiki"
          />
          {/* Lores */}
          <RailButton
            as="button"
            icon={Library}
            label="Lores"
            active={openFlyout === "lore"}
            onClick={() => setOpenFlyout(openFlyout === "lore" ? null : "lore")}
          />
          <div className="h-px w-9 bg-white/10 my-1" />
          {/* Groupes de règles */}
          {ruleGroups.map((group) => {
            const Icon = groupIcons[group.slug] ?? BookOpen;
            const active = currentGroupSlug === group.slug;
            return (
              <RailButton
                key={group.slug}
                as="link"
                href={`/${group.slug}`}
                icon={Icon}
                label={group.title}
                active={active}
              />
            );
          })}
          {/* Raccourcis compte — visibles uniquement si connecté */}
          {user && (
            <>
              <div className="h-px w-9 bg-white/10 my-1 mt-auto" />
              <RailButton
                as="link"
                href="/profil"
                icon={User}
                label="Mon profil"
                active={location === "/profil"}
              />
              <RailButton
                as="link"
                href="/tickets"
                icon={Ticket}
                label="Tickets"
                active={location === "/tickets"}
              />
              {user.gerantFactions.length > 0 && (
                <RailButton
                  as="link"
                  href="/gerant"
                  icon={KeyRound}
                  label={
                    user.gerantFactions.length === 1
                      ? `Gérant · ${user.gerantFactions[0]}`
                      : `Gérant (${user.gerantFactions.length} factions)`
                  }
                  active={location === "/gerant"}
                />
              )}
            </>
          )}
        </div>

        {/* Flyout panel — groupes de règles */}
        {flyoutGroup && (
          <div
            ref={flyoutRef}
            className="absolute left-[76px] top-0 bottom-0 w-64 bg-popover/95 backdrop-blur-md border-r border-white/10 z-20 animate-in slide-in-from-left-2 fade-in duration-200"
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

        {/* Flyout panel — Lores */}
        {openFlyout === "lore" && (
          <div
            ref={flyoutRef}
            className="absolute left-[76px] top-0 bottom-0 w-64 bg-popover/95 backdrop-blur-md border-r border-white/10 z-20 animate-in slide-in-from-left-2 fade-in duration-200"
          >
            <div className="px-5 pt-5 pb-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary">
                Lores — Factions
              </p>
            </div>
            <ScrollArea className="h-[calc(100%-3.5rem)]">
              <nav className="px-3 pb-6 space-y-0.5">
                {LORES.map((lore) => (
                  <a
                    key={lore.slug}
                    href={`${WIKI_BASE}/lore-faction/${lore.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  >
                    <span>{lore.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </a>
                ))}
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
  as: "link" | "a" | "button";
  href?: string;
  icon: typeof House;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const cls = `group relative w-14 h-14 flex items-center justify-center rounded-[14px] transition-colors ${
    active
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground bg-white/[0.04] hover:text-primary hover:bg-white/[0.08]"
  }`;
  const inner = (
    <>
      <Icon className="w-6 h-6" />
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
  if (as === "a" && href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls} aria-label={label}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} aria-label={label}>
      {inner}
    </button>
  );
}

function AuthButton() {
  const { user, isAdmin, isLoading, login, logout } = useAuth();
  const ticketCount = useTicketBadgeCount();
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

  const statusLabel = user.isResponsable
    ? "Responsable"
    : user.faction ?? "Whitelisté";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 hover:border-primary/40 hover:bg-white/[0.07] transition-colors"
      >
        <span className="relative shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
            />
          ) : (
            <span className="w-10 h-10 rounded-full bg-primary/15 ring-2 ring-white/10 flex items-center justify-center">
              <FaDiscord className="w-5 h-5 text-primary" />
            </span>
          )}
          {ticketCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-red-500 border border-background flex items-center justify-center text-[0.55rem] font-bold text-white leading-none px-1">
              {ticketCount > 9 ? "9+" : ticketCount}
            </span>
          )}
        </span>
        <span className="hidden sm:flex flex-col items-start min-w-0">
          <span className="text-sm font-bold text-foreground leading-tight max-w-[10rem] truncate">
            {user.displayName}
          </span>
          <span className="text-[0.7rem] font-semibold text-primary leading-tight">
            {statusLabel}
          </span>
        </span>
        <ChevronsRight className="hidden sm:block w-4 h-4 text-foreground/30 shrink-0" />
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
          {user.gerantFactions.length > 0 && (
            <Link
              href="/gerant"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-white/5 transition-colors border-t border-white/5"
            >
              <KeyRound className="w-4 h-4" />
              Ma faction
            </Link>
          )}
          <Link
            href="/tickets"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-white/5 transition-colors border-t border-white/5"
          >
            <Ticket className="w-4 h-4" />
            Tickets
            {ticketCount > 0 && (
              <span className="ml-auto min-w-[20px] h-5 rounded-full bg-red-500 flex items-center justify-center text-[0.6rem] font-bold text-white px-1.5 leading-none">
                {ticketCount > 9 ? "9+" : ticketCount}
              </span>
            )}
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-white/5 transition-colors border-t border-white/5"
            >
              <ShieldCheck className="w-4 h-4" />
              Administration
            </Link>
          )}
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
