import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Trophy,
  Crosshair,
  Users,
  ShieldHalf,
  AlertTriangle,
  Gamepad2,
  Ban,
  UserPlus,
  Trash2,
  Loader2,
  Search,
} from "lucide-react";
import { FaDiscord } from "react-icons/fa6";
import {
  useAuth,
  useGerantMembers,
  useBlacklist,
  useAddBlacklist,
  useRemoveBlacklist,
  type GerantMember,
  type BlacklistEntry,
} from "@/lib/use-auth";

const FACTION_COLORS: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  Mangemort: { bg: "bg-red-950/30", border: "border-red-700/40", text: "text-red-300", accent: "bg-red-500" },
  Auror: { bg: "bg-blue-950/30", border: "border-blue-700/40", text: "text-blue-300", accent: "bg-blue-500" },
  Ministère: { bg: "bg-purple-950/30", border: "border-purple-700/40", text: "text-purple-300", accent: "bg-purple-500" },
  "Mage-Indépendant": { bg: "bg-emerald-950/30", border: "border-emerald-700/40", text: "text-emerald-300", accent: "bg-emerald-500" },
  Professeur: { bg: "bg-amber-950/30", border: "border-amber-700/40", text: "text-amber-300", accent: "bg-amber-500" },
};

type GerantTab = "members" | "blacklist";

export default function Gerant() {
  const { user, isLoading: authLoading, login } = useAuth();
  const isGerant = (user?.gerantFactions.length ?? 0) > 0;
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);
  const activeFaction = selectedFaction ?? user?.gerantFactions[0] ?? null;
  const [tab, setTab] = useState<GerantTab>("members");

  const members = useGerantMembers(isGerant && tab === "members", activeFaction);
  const [search, setSearch] = useState("");

  if (authLoading) {
    return (
      <div className="animate-in fade-in duration-500 space-y-4">
        <div className="h-24 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
        <div className="h-64 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6">
          <FaDiscord className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Connexion requise</h1>
        <p className="text-foreground/60 mb-8 leading-relaxed">
          Connecte-toi avec Discord pour accéder à la gestion de ta faction.
        </p>
        <button
          type="button"
          onClick={login}
          className="inline-flex items-center gap-2 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground font-semibold px-6 py-3 transition-colors"
        >
          Se connecter avec Discord
        </button>
      </div>
    );
  }

  if (!isGerant) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-destructive/15 flex items-center justify-center mx-auto mb-6">
          <ShieldHalf className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Accès réservé</h1>
        <p className="text-foreground/60 leading-relaxed">Cette page est réservée aux gérants de faction.</p>
      </div>
    );
  }

  const factionName = activeFaction!;
  const colors = FACTION_COLORS[factionName] ?? {
    bg: "bg-white/[0.03]", border: "border-white/10", text: "text-primary", accent: "bg-primary",
  };

  const isBotMissing =
    members.isError && (members.error as Error)?.message === "bot_token_missing";

  const filtered = (members.data?.members ?? []).filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return m.displayName.toLowerCase().includes(q) || m.username.toLowerCase().includes(q);
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      <Link
        href="/"
        className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors mb-6 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Accueil</span>
      </Link>

      <header className="flex items-center gap-4 mb-6">
        <span className={`w-14 h-14 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
          <ShieldHalf className={`w-7 h-7 ${colors.text}`} />
        </span>
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">Ma faction</p>
          <h1 className={`font-serif text-3xl font-bold tracking-tight ${colors.text}`}>{factionName}</h1>
        </div>
      </header>

      {/* Faction selector (multi-gérant) */}
      {user.gerantFactions.length > 1 && (
        <div className="flex items-center gap-1 mb-5 p-1 rounded-full bg-white/[0.04] border border-white/10 w-fit flex-wrap">
          {user.gerantFactions.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedFaction(f)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                f === factionName ? "bg-primary/90 text-primary-foreground" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-8 p-1 rounded-full bg-white/[0.04] border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => setTab("members")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "members" ? "bg-primary/90 text-primary-foreground" : "text-foreground/60 hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Membres
        </button>
        <button
          type="button"
          onClick={() => setTab("blacklist")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "blacklist" ? "bg-destructive/80 text-white" : "text-foreground/60 hover:text-foreground"
          }`}
        >
          <Ban className="w-4 h-4" />
          Blacklist
        </button>
      </div>

      {/* ── Members tab ── */}
      {tab === "members" && (
        <>
          {isBotMissing && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-300 mb-1">Configuration requise</p>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  Pour afficher les membres Discord de ta faction, ajoute la variable{" "}
                  <code className="font-mono bg-white/10 px-1 rounded">DISCORD_BOT_TOKEN</code> dans les variables d'environnement Railway.
                </p>
              </div>
            </div>
          )}
          {members.isError && !isBotMissing && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-foreground/80 mb-6">
              Impossible de charger les membres pour le moment. Réessaie plus tard.
            </div>
          )}
          {members.isLoading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
              ))}
            </div>
          )}
          {members.data && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un membre…"
                    className="w-full rounded-full bg-white/[0.04] border border-white/10 pl-4 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <span className="flex items-center gap-2 text-sm text-foreground/50">
                  <Users className="w-4 h-4" />
                  {members.data.members.length} membre{members.data.members.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 px-4 py-3 border-b border-white/10 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                  <span className="w-8" />
                  <span>Membre</span>
                  <span className="text-center">Steam ID</span>
                  <span className="text-right">Réputation</span>
                  <span className="text-right pl-3">Captures</span>
                </div>
                {filtered.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-foreground/50">
                    {search ? "Aucun membre trouvé." : "Aucun membre dans cette faction."}
                  </p>
                ) : (
                  <ul>
                    {filtered.map((m) => (
                      <MemberRow key={m.id} member={m} />
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Blacklist tab ── */}
      {tab === "blacklist" && (
        <BlacklistTab faction={factionName} />
      )}
    </div>
  );
}

// ─── Member row ───────────────────────────────────────────────────────────────

function MemberRow({ member }: { member: GerantMember }) {
  return (
    <li className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 px-4 py-3 items-center border-b border-white/[0.04] last:border-b-0">
      {member.avatarUrl ? (
        <img src={member.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
      ) : (
        <span className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
          <FaDiscord className="w-4 h-4 text-primary" />
        </span>
      )}
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">{member.displayName}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {member.displayName !== member.username && (
            <p className="text-xs text-foreground/40 truncate">{member.username}</p>
          )}
          {member.grade && (
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[0.65rem] font-semibold text-foreground/70">
              {member.grade}
            </span>
          )}
        </div>
      </div>
      <div className="text-center">
        {member.steamId ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[0.65rem] font-mono text-primary/80">
            <Gamepad2 className="w-3 h-3" />
            {member.steamId}
          </span>
        ) : (
          <span className="text-foreground/25 text-xs">—</span>
        )}
      </div>
      <div className="text-right">
        <div className="flex items-center gap-1.5 justify-end">
          <Trophy className="w-3.5 h-3.5 text-primary/60" />
          <span className="text-foreground/80 tabular-nums text-sm">{member.points.toLocaleString("fr-FR")}</span>
        </div>
        {member.rank !== null && <p className="text-xs text-foreground/40">#{member.rank}</p>}
      </div>
      <div className="text-right pl-3">
        <div className="flex items-center gap-1.5 justify-end">
          <Crosshair className="w-3.5 h-3.5 text-foreground/30" />
          <span className="text-foreground/60 tabular-nums text-sm">{member.captures}</span>
        </div>
      </div>
    </li>
  );
}

// ─── Blacklist tab ────────────────────────────────────────────────────────────

function BlacklistTab({ faction }: { faction: string }) {
  const bl = useBlacklist(true, faction);
  const add = useAddBlacklist();
  const remove = useRemoveBlacklist();

  const [discordId, setDiscordId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const list = bl.data?.entries ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (e) =>
        e.playerName.toLowerCase().includes(q) ||
        e.discordId.includes(q) ||
        (e.reason ?? "").toLowerCase().includes(q),
    );
  }, [bl.data, search]);

  const handleAdd = (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    const id = discordId.trim();
    const name = playerName.trim();
    if (!/^\d{15,25}$/.test(id)) {
      setFormError("L'identifiant Discord doit contenir 15 à 25 chiffres uniquement.");
      return;
    }
    if (!name) {
      setFormError("Le nom du joueur est requis.");
      return;
    }
    add.mutate(
      { faction, discordId: id, playerName: name, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          setDiscordId("");
          setPlayerName("");
          setReason("");
        },
        onError: (err) => setFormError((err as Error).message),
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="rounded-2xl border border-destructive/20 bg-destructive/[0.04] p-5">
        <div className="flex items-center gap-2 text-destructive mb-1">
          <UserPlus className="w-4 h-4" />
          <h2 className="font-serif text-sm font-semibold uppercase tracking-[0.16em]">
            Ajouter à la blacklist
          </h2>
        </div>
        <p className="text-sm text-foreground/55 mb-4 leading-relaxed">
          Les joueurs blacklistés sont signalés à tous les gérants de la faction.
          L'identifiant Discord se copie via clic droit → «&nbsp;Copier l'ID utilisateur&nbsp;» (mode développeur activé).
        </p>

        {bl.data?.dbConfigured === false && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground/80 mb-4">
            La base de données n'est pas encore configurée sur ce serveur.
          </div>
        )}

        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              inputMode="numeric"
              value={discordId}
              onChange={(e) => setDiscordId(e.target.value)}
              placeholder="Discord ID (ex. 123456789012345678)"
              disabled={!bl.data?.dbConfigured}
              className="flex-1 rounded-full bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-destructive/50 transition-colors disabled:opacity-50"
            />
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nom du joueur"
              disabled={!bl.data?.dbConfigured}
              className="sm:w-48 rounded-full bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-destructive/50 transition-colors disabled:opacity-50"
            />
          </div>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Raison (optionnel)"
            maxLength={300}
            disabled={!bl.data?.dbConfigured}
            className="w-full rounded-full bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-destructive/50 transition-colors disabled:opacity-50"
          />
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <button
            type="submit"
            disabled={!bl.data?.dbConfigured || add.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-destructive/80 hover:bg-destructive text-white font-semibold px-5 py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {add.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
            Blacklister
          </button>
        </form>
      </div>

      {/* List */}
      {bl.isLoading && (
        <div className="h-40 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
      )}
      {bl.isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-foreground/80">
          Impossible de charger la blacklist. Réessaie plus tard.
        </div>
      )}

      {bl.data?.dbConfigured && (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher dans la blacklist…"
              className="w-full rounded-full bg-white/[0.04] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="px-4 py-3 border-b border-white/10 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-foreground/45 flex items-center justify-between">
              <span>Joueurs blacklistés — {faction}</span>
              <span>{bl.data.entries.length} entrée{bl.data.entries.length !== 1 ? "s" : ""}</span>
            </div>
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-foreground/50">
                {search ? "Aucun résultat." : "Aucun joueur blacklisté pour cette faction."}
              </p>
            ) : (
              <ul>
                {filtered.map((e) => (
                  <BlacklistRow
                    key={e.id}
                    entry={e}
                    removing={remove.isPending && (remove.variables as { id: number })?.id === e.id}
                    onRemove={() => remove.mutate({ id: e.id, faction: e.faction })}
                  />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function BlacklistRow({
  entry,
  removing,
  onRemove,
}: {
  entry: BlacklistEntry;
  removing: boolean;
  onRemove: () => void;
}) {
  const date = new Date(entry.createdAt).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  return (
    <li className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] last:border-b-0">
      <span className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
        <Ban className="w-4 h-4 text-destructive" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground">{entry.playerName}</span>
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] rounded-full bg-white/10 text-foreground/50 px-2 py-0.5">
            {date}
          </span>
        </div>
        <p className="text-xs text-foreground/40 font-mono truncate">{entry.discordId}</p>
        {entry.reason && (
          <p className="text-sm text-foreground/65 mt-1 leading-relaxed">{entry.reason}</p>
        )}
        <p className="text-[0.68rem] text-foreground/35 mt-1">
          Ajouté par {entry.addedByUsername}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={removing}
        aria-label="Retirer de la blacklist"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 disabled:opacity-50"
      >
        {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </li>
  );
}
