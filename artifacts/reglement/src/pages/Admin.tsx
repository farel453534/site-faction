import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ShieldCheck,
  Trophy,
  Crosshair,
  MapPin,
  Calendar,
  Search,
  X,
  Users,
  UserPlus,
  Trash2,
  Shield,
  Loader2,
  MonitorSmartphone,
} from "lucide-react";
import { FaDiscord } from "react-icons/fa6";
import {
  useAuth,
  useAdminPlayers,
  useAdminPlayerStats,
  useAdminList,
  useAddAdmin,
  useRemoveAdmin,
  usePanelUsers,
  type LeaderboardEntry,
  type CaptureEntry,
  type AdminEntry,
  type PanelUser,
} from "@/lib/use-auth";

type AdminTab = "stats" | "admins" | "panel-users";

function playerName(p: { displayName: string | null; userId: string }): string {
  if (p.displayName) return p.displayName;
  if (p.userId.startsWith("nom:")) return p.userId.slice(4);
  return `Joueur ${p.userId.slice(-4)}`;
}

export default function Admin() {
  const { user, isAdmin, isLoading: authLoading, login } = useAuth();
  const players = useAdminPlayers(!!user && isAdmin);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<AdminTab>("stats");
  const detail = useAdminPlayerStats(selected);
  const panelUsers = usePanelUsers(!!user && isAdmin && tab === "panel-users");

  const filtered = useMemo(() => {
    const list = players.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        playerName(p).toLowerCase().includes(q) ||
        p.userId.toLowerCase().includes(q),
    );
  }, [players.data, search]);

  const selectedPlayer = useMemo(
    () => (players.data ?? []).find((p) => p.userId === selected) ?? null,
    [players.data, selected],
  );

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
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
          Connexion requise
        </h1>
        <p className="text-foreground/60 mb-8 leading-relaxed">
          Connecte-toi avec Discord pour accéder à l'administration.
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

  if (!isAdmin) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-destructive/15 flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
          Accès réservé
        </h1>
        <p className="text-foreground/60 leading-relaxed">
          Cette page est réservée aux administrateurs de la faction.
        </p>
      </div>
    );
  }

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
        <span className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-7 h-7 text-primary" />
        </span>
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Administration
          </p>
          <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">
            {tab === "stats"
              ? "Statistiques des joueurs"
              : "Gestion des administrateurs"}
          </h1>
        </div>
      </header>

      <div className="flex items-center gap-1 mb-8 p-1 rounded-full bg-white/[0.04] border border-white/10 w-fit flex-wrap">
        <button
          type="button"
          onClick={() => setTab("stats")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "stats"
              ? "bg-primary/90 text-primary-foreground"
              : "text-foreground/60 hover:text-foreground"
          }`}
        >
          <Trophy className="w-4 h-4" />
          Joueurs
        </button>
        <button
          type="button"
          onClick={() => setTab("admins")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "admins"
              ? "bg-primary/90 text-primary-foreground"
              : "text-foreground/60 hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Administrateurs
        </button>
        <button
          type="button"
          onClick={() => setTab("panel-users")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "panel-users"
              ? "bg-primary/90 text-primary-foreground"
              : "text-foreground/60 hover:text-foreground"
          }`}
        >
          <MonitorSmartphone className="w-4 h-4" />
          Membres connectés
        </button>
      </div>

      {tab === "stats" && (
        <>
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un joueur (nom ou ID)…"
              className="w-full rounded-full bg-white/[0.04] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {players.isLoading && (
            <div className="h-64 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
          )}

          {players.isError && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-foreground/80">
              Impossible de charger le classement pour le moment. Réessaie plus
              tard.
            </div>
          )}

          {players.data && (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="grid grid-cols-[3rem_1fr_auto_auto] gap-3 px-4 py-3 border-b border-white/10 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                <span>#</span>
                <span>Joueur</span>
                <span className="text-right">Réputation</span>
                <span className="text-right pl-3">Captures</span>
              </div>
              {filtered.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-foreground/50">
                  Aucun joueur trouvé.
                </p>
              ) : (
                <ul>
                  {filtered.map((p) => (
                    <li key={p.userId}>
                      <button
                        type="button"
                        onClick={() => setSelected(p.userId)}
                        className="grid w-full grid-cols-[3rem_1fr_auto_auto] gap-3 px-4 py-3 items-center border-b border-white/[0.04] last:border-b-0 text-left hover:bg-white/[0.03] transition-colors"
                      >
                        <span className="font-serif font-bold text-primary">
                          {p.rank}
                        </span>
                        <span className="truncate text-foreground font-medium">
                          {playerName(p)}
                        </span>
                        <span className="text-right text-foreground/80 tabular-nums">
                          {p.points.toLocaleString("fr-FR")}
                        </span>
                        <span className="text-right pl-3 text-foreground/60 tabular-nums">
                          {p.captures}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      {tab === "admins" && <AdminsManager currentUserId={user.id} />}

      {tab === "panel-users" && <PanelUsersTab data={panelUsers} isResponsable={user.isResponsable ?? false} />}

      {selectedPlayer && (
        <PlayerDetail
          player={selectedPlayer}
          detail={detail}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function PlayerDetail({
  player,
  detail,
  onClose,
}: {
  player: LeaderboardEntry;
  detail: ReturnType<typeof useAdminPlayerStats>;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-popover shadow-2xl shadow-black/60 animate-in slide-in-from-bottom-4 duration-300 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-white/10 sticky top-0 bg-popover">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Joueur · Rang #{player.rank}
            </p>
            <h2 className="font-serif text-xl font-bold text-foreground">
              {playerName(player)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-white/5 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Trophy className="w-4 h-4" />
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
                  Réputation
                </span>
              </div>
              <p className="font-serif text-2xl font-bold text-foreground">
                {player.points.toLocaleString("fr-FR")}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Crosshair className="w-4 h-4" />
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
                  Captures
                </span>
              </div>
              <p className="font-serif text-2xl font-bold text-foreground">
                {player.captures.toLocaleString("fr-FR")}
              </p>
            </div>
          </div>

          <h3 className="font-serif text-sm font-semibold text-primary mb-3">
            Dernières captures
          </h3>
          {detail.isLoading && (
            <div className="h-20 rounded-xl bg-white/[0.04] border border-white/10 animate-pulse" />
          )}
          {detail.isError && (
            <p className="text-sm text-foreground/60">
              Impossible de charger le détail.
            </p>
          )}
          {detail.data &&
            (detail.data.captures.recent.length === 0 ? (
              <p className="text-foreground/50 text-sm">
                Aucune capture recensée pour ce joueur.
              </p>
            ) : (
              <ul className="space-y-3">
                {detail.data.captures.recent.map((c, i) => (
                  <CaptureRow key={i} entry={c} />
                ))}
              </ul>
            ))}
        </div>
      </div>
    </div>
  );
}

function CaptureRow({ entry }: { entry: CaptureEntry }) {
  return (
    <li className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <span className="font-semibold text-foreground">
          {entry.agresseur ? `Capturé par ${entry.agresseur}` : "Capture"}
          {entry.captureNumero ? (
            <span className="text-primary"> #{entry.captureNumero}</span>
          ) : null}
        </span>
        {entry.dateEvent && (
          <span className="flex items-center gap-1.5 text-xs text-foreground/50 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
            {entry.dateEvent}
          </span>
        )}
      </div>
      {entry.lieu && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/65">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary/70" />
            {entry.lieu}
          </span>
        </div>
      )}
    </li>
  );
}

function AdminsManager({ currentUserId }: { currentUserId: string }) {
  const list = useAdminList(true);
  const addAdmin = useAddAdmin();
  const removeAdmin = useRemoveAdmin();
  const [discordId, setDiscordId] = useState("");
  const [label, setLabel] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const dbConfigured = list.data?.dbConfigured ?? true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const id = discordId.trim();
    if (!/^\d{15,25}$/.test(id)) {
      setFormError("L'identifiant Discord doit contenir uniquement des chiffres (15 à 25).");
      return;
    }
    addAdmin.mutate(
      { discordId: id, label: label.trim() || undefined },
      {
        onSuccess: () => {
          setDiscordId("");
          setLabel("");
        },
        onError: (err) => setFormError((err as Error).message),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center gap-2 text-primary mb-1">
          <UserPlus className="w-4 h-4" />
          <h2 className="font-serif text-sm font-semibold uppercase tracking-[0.16em]">
            Ajouter un administrateur
          </h2>
        </div>
        <p className="text-sm text-foreground/55 mb-4 leading-relaxed">
          Colle l'identifiant Discord (clic droit sur le profil → « Copier l'ID
          utilisateur », mode développeur activé). Un nom facultatif aide à s'y
          retrouver.
        </p>

        {!dbConfigured && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground/80 mb-4">
            La base de données n'est pas encore configurée sur ce serveur.
            L'ajout d'administrateurs depuis le site sera disponible une fois la
            base de données branchée.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              inputMode="numeric"
              value={discordId}
              onChange={(e) => setDiscordId(e.target.value)}
              placeholder="Identifiant Discord (ex. 123456789012345678)"
              disabled={!dbConfigured}
              className="flex-1 rounded-full bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
            />
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Nom (facultatif)"
              disabled={!dbConfigured}
              className="sm:w-48 rounded-full bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
            />
          </div>
          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}
          <button
            type="submit"
            disabled={!dbConfigured || addAdmin.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground font-semibold px-5 py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addAdmin.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Ajouter
          </button>
        </form>
      </div>

      {list.isLoading && (
        <div className="h-40 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
      )}

      {list.isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-foreground/80">
          Impossible de charger la liste des administrateurs.
        </div>
      )}

      {list.data && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="px-4 py-3 border-b border-white/10 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-foreground/45">
            Administrateurs actuels ({list.data.admins.length})
          </div>
          <ul>
            {list.data.admins.map((a) => (
              <AdminRow
                key={a.discordId}
                admin={a}
                isSelf={a.discordId === currentUserId}
                onRemove={() => removeAdmin.mutate(a.discordId)}
                removing={
                  removeAdmin.isPending &&
                  removeAdmin.variables === a.discordId
                }
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Panel Users tab ──────────────────────────────────────────────────────────

function PanelUsersTab({
  data,
  isResponsable,
}: {
  data: ReturnType<typeof usePanelUsers>;
  isResponsable: boolean;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const list = data.data?.users ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (u) =>
        (u.globalName ?? u.username).toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.discordId.includes(q) ||
        (u.steamId ?? "").includes(q) ||
        (u.faction ?? "").toLowerCase().includes(q) ||
        (isResponsable && (u.lastIp ?? "").includes(q)),
    );
  }, [data.data, search, isResponsable]);

  return (
    <div className="space-y-5">
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, Discord ID, Steam ID ou faction…"
          className="w-full rounded-full bg-white/[0.04] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {data.isLoading && (
        <div className="h-64 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
      )}

      {data.isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-foreground/80">
          Impossible de charger la liste des membres connectés.
        </div>
      )}

      {data.data && !data.data.dbConfigured && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-foreground/80">
          La base de données n'est pas encore configurée sur ce serveur.
        </div>
      )}

      {data.data?.dbConfigured && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-3 border-b border-white/10 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-foreground/45">
            <span>Membre</span>
            <span className="text-center">Faction</span>
            <span className="text-center">Steam ID</span>
            <span className="text-right">Dernière co.</span>
          </div>
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-foreground/50">
              {search ? "Aucun membre trouvé." : "Aucun membre connecté pour l'instant."}
            </p>
          ) : (
            <ul>
              {filtered.map((u) => (
                <PanelUserRow key={u.discordId} user={u} isResponsable={isResponsable} />
              ))}
            </ul>
          )}
          <div className="px-4 py-2.5 border-t border-white/[0.06] text-[0.68rem] text-foreground/35">
            {data.data.users.length} compte{data.data.users.length !== 1 ? "s" : ""} enregistré{data.data.users.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}

function PanelUserRow({ user, isResponsable }: { user: PanelUser; isResponsable: boolean }) {
  const lastSeen = new Date(user.lastSeenAt);
  const firstSeen = new Date(user.firstSeenAt);
  const dateStr = lastSeen.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
  const firstDateStr = firstSeen.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  return (
    <li className="px-4 py-3 border-b border-white/[0.04] last:border-b-0">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-start">
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">
            {user.globalName ?? user.username}
          </p>
          <p className="text-xs text-foreground/40 font-mono truncate">
            {user.discordId}
          </p>
          {/* Infos visibles uniquement par le responsable */}
          {isResponsable && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
              <span className="text-[0.65rem] text-foreground/35 font-mono">
                IP : {user.lastIp ?? <span className="italic">inconnue</span>}
              </span>
              <span className="text-[0.65rem] text-foreground/30">
                1ère co. : {firstDateStr}
              </span>
            </div>
          )}
        </div>
        <span className="text-xs text-foreground/60 px-2 text-center">
          {user.faction ?? <span className="text-foreground/30">—</span>}
        </span>
        <span className="text-xs font-mono text-foreground/60 px-2 text-center">
          {user.steamId ? (
            user.steamId
          ) : (
            <span className="text-foreground/25">—</span>
          )}
        </span>
        <span className="text-xs text-foreground/40 text-right shrink-0">{dateStr}</span>
      </div>
    </li>
  );
}

function AdminRow({
  admin,
  isSelf,
  onRemove,
  removing,
}: {
  admin: AdminEntry;
  isSelf: boolean;
  onRemove: () => void;
  removing: boolean;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-b-0">
      <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Shield className="w-4 h-4 text-primary" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground truncate">
            {admin.label || `Admin ${admin.discordId.slice(-4)}`}
          </span>
          {admin.source === "env" && (
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] rounded-full bg-primary/15 text-primary px-2 py-0.5">
              Principal
            </span>
          )}
          {isSelf && (
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] rounded-full bg-white/10 text-foreground/70 px-2 py-0.5">
              Vous
            </span>
          )}
        </div>
        <p className="text-xs text-foreground/45 font-mono truncate">
          {admin.discordId}
        </p>
      </div>
      {admin.removable ? (
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          aria-label="Retirer cet administrateur"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 disabled:opacity-50"
        >
          {removing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      ) : (
        <span className="text-[0.62rem] text-foreground/35 uppercase tracking-[0.12em] shrink-0 pr-1">
          Config
        </span>
      )}
    </li>
  );
}
