import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Trophy,
  Crosshair,
  MapPin,
  Calendar,
  LogIn,
  ShieldHalf,
  Gamepad2,
  Check,
  Loader2,
} from "lucide-react";
import { FaDiscord } from "react-icons/fa6";
import {
  useAuth,
  usePlayerStats,
  useMyProfile,
  useUpdateSteamId,
  type CaptureEntry,
} from "@/lib/use-auth";

const FACTION_COLORS: Record<string, string> = {
  Mangemort: "bg-red-950/60 border-red-700/50 text-red-300",
  Auror: "bg-blue-950/60 border-blue-700/50 text-blue-300",
  Ministère: "bg-purple-950/60 border-purple-700/50 text-purple-300",
  "Mage-Indépendant": "bg-emerald-950/60 border-emerald-700/50 text-emerald-300",
  Professeur: "bg-amber-950/60 border-amber-700/50 text-amber-300",
};

const GERANT_COLORS: Record<string, string> = {
  Mangemort: "bg-red-950/60 border-red-600/50 text-red-300",
  Auror: "bg-blue-950/60 border-blue-600/50 text-blue-300",
  Ministère: "bg-purple-950/60 border-purple-600/50 text-purple-300",
  "Mage-Indépendant": "bg-emerald-950/60 border-emerald-600/50 text-emerald-300",
};

function ProfileBadges({ user }: { user: { faction: string | null; grade: string | null; isResponsable: boolean; gerantFactions: string[] } }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {user.isResponsable && (
        <>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/60 bg-yellow-950/50 px-3 py-0.5 text-xs font-bold text-yellow-300 tracking-wide">
            ⭐ Responsable
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-500/50 bg-fuchsia-950/40 px-3 py-0.5 text-xs font-semibold text-fuchsia-300 tracking-wide">
            🛡️ Accès total
          </span>
        </>
      )}
      {!user.isResponsable && user.gerantFactions.map((f) => (
        <span key={f} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold ${GERANT_COLORS[f] ?? "bg-orange-950/60 border-orange-500/50 text-orange-300"}`}>
          🔑 Gérant {f}
        </span>
      ))}
      {user.faction && (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold ${FACTION_COLORS[user.faction] ?? "bg-white/5 border-white/10 text-foreground/70"}`}>
          <ShieldHalf className="w-3 h-3" />
          {user.faction}
        </span>
      )}
      {user.grade && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-0.5 text-xs font-semibold text-foreground/80">
          {user.grade}
        </span>
      )}
      {!user.isResponsable && user.gerantFactions.length === 0 && !user.faction && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-0.5 text-xs text-foreground/40">
          Aucune faction détectée
        </span>
      )}
    </div>
  );
}

type SteamFormat = "text" | "32" | "64";

const STEAM_FORMAT_CONFIG: Record<SteamFormat, {
  label: string;
  badge: string;
  hint: string;
  placeholder: string;
  maxLen: number;
  numeric: boolean;
}> = {
  "text": {
    label: "Steam",
    badge: "Recommandé",
    hint: "Le format texte affiché dans tes paramètres Steam (ex.\u00a0: STEAM_1:1:36048523).",
    placeholder: "ex. STEAM_1:1:36048523",
    maxLen: 30,
    numeric: false,
  },
  "32": {
    label: "SteamID32",
    badge: "",
    hint: "Le format numérique court (ex.\u00a0: 72097047). Il sera automatiquement converti.",
    placeholder: "ex. 72097047",
    maxLen: 10,
    numeric: true,
  },
  "64": {
    label: "SteamID64",
    badge: "",
    hint: "Le format long à 17 chiffres (ex.\u00a0: 76561198000000000).",
    placeholder: "ex. 76561198000000000",
    maxLen: 17,
    numeric: true,
  },
};

function SteamIdSection({ userId: _userId }: { userId: string }) {
  const profile = useMyProfile(true);
  const updateSteamId = useUpdateSteamId();

  const savedSteamId = profile.data?.steamId ?? null;
  const [format, setFormat] = useState<SteamFormat>("text");
  const [input, setInput] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const cfg = STEAM_FORMAT_CONFIG[format];
  const displayValue = input !== null ? input : (savedSteamId ?? "");
  const isDirty = input !== null && input !== (savedSteamId ?? "");

  const handleFormatChange = (f: SteamFormat) => {
    setFormat(f);
    setInput(null); // reset input on format switch
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (cfg.numeric) {
      // Strip non-digits for numeric formats
      setInput(e.target.value.replace(/\D/g, "").slice(0, cfg.maxLen));
    } else {
      setInput(e.target.value.slice(0, cfg.maxLen));
    }
  };

  const handleSave = () => {
    const val = displayValue.trim() || null;
    updateSteamId.mutate(val, {
      onSuccess: () => {
        setSaved(true);
        setInput(null);
        setTimeout(() => setSaved(false), 2000);
      },
    });
  };

  const handleClear = () => {
    updateSteamId.mutate(null, {
      onSuccess: () => {
        setInput("");
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    });
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 text-primary mb-1">
        <Gamepad2 className="w-4 h-4" />
        <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.2em]">
          Steam ID
        </h2>
      </div>
      <p className="text-sm text-foreground/55 mb-4 leading-relaxed">
        Renseigne ton Steam ID pour que les gérants de ta faction puissent te retrouver en jeu.
        Tu le trouves sur{" "}
        <a
          href="https://store.steampowered.com/account/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2"
        >
          steamcommunity.com
        </a>
        .
      </p>

      {profile.isLoading && (
        <div className="h-10 rounded-full bg-white/[0.04] border border-white/10 animate-pulse" />
      )}

      {!profile.isLoading && profile.data?.dbConfigured === false && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground/70">
          La base de données n'est pas encore configurée sur ce serveur.
        </div>
      )}

      {!profile.isLoading && profile.data?.dbConfigured !== false && (
        <div className="space-y-3">
          {/* Format toggle */}
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-0.5 gap-0.5">
            {(["text", "32", "64"] as SteamFormat[]).map((f) => {
              const active = format === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleFormatChange(f)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                    active
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-foreground/50 hover:text-foreground"
                  }`}
                >
                  {STEAM_FORMAT_CONFIG[f].label}
                  {STEAM_FORMAT_CONFIG[f].badge && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide leading-none ${
                      active ? "bg-white/20 text-primary-foreground" : "bg-primary/20 text-primary"
                    }`}>
                      {STEAM_FORMAT_CONFIG[f].badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Hint for selected format */}
          <p className="text-xs text-foreground/40 leading-relaxed">{cfg.hint}</p>

          {/* Input + save */}
          <div className="flex gap-2">
            <input
              type="text"
              inputMode={cfg.numeric ? "numeric" : "text"}
              value={displayValue}
              onChange={handleChange}
              placeholder={cfg.placeholder}
              maxLength={cfg.maxLen}
              className="flex-1 rounded-full bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 font-mono focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || updateSteamId.isPending}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground font-semibold px-4 py-2.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {updateSteamId.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : null}
              {saved ? "Enregistré" : "Enregistrer"}
            </button>
          </div>

          {updateSteamId.isError && (
            <p className="text-sm text-destructive">
              {(updateSteamId.error as Error).message}
            </p>
          )}

          {savedSteamId && (
            <button
              type="button"
              onClick={handleClear}
              disabled={updateSteamId.isPending}
              className="text-xs text-foreground/40 hover:text-destructive transition-colors underline underline-offset-2"
            >
              Supprimer mon Steam ID
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default function Profile() {
  const { user, isLoading: authLoading, login } = useAuth();
  const stats = usePlayerStats(!!user);

  if (authLoading) {
    return (
      <div className="animate-in fade-in duration-500 space-y-4">
        <div className="h-24 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
        <div className="h-40 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
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
          Connecte-toi avec Discord pour voir ta réputation et tes captures au
          sein de la faction.
        </p>
        <button
          type="button"
          onClick={login}
          className="inline-flex items-center gap-2 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground font-semibold px-6 py-3 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Se connecter avec Discord
        </button>
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

      <header className="flex items-center gap-4 mb-10">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover ring-1 ring-primary/30"
          />
        ) : (
          <span className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
            <FaDiscord className="w-7 h-7 text-primary" />
          </span>
        )}
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Mon profil
          </p>
          <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">
            {user.displayName}
          </h1>
          <ProfileBadges user={user} />
        </div>
      </header>

      {/* Steam ID section */}
      <div className="mb-8">
        <SteamIdSection userId={user.id} />
      </div>

      {stats.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <div className="h-32 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
          <div className="h-32 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
        </div>
      )}

      {stats.isError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-foreground/80 mb-8">
          Impossible de charger tes statistiques pour le moment. Réessaie plus
          tard.
        </div>
      )}

      {stats.data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 mb-10">
            <StatCard
              icon={<Trophy className="w-5 h-5" />}
              label="Réputation"
              value={stats.data.reputation.points.toLocaleString("fr-FR")}
              hint={
                stats.data.reputation.rank
                  ? `Classé #${stats.data.reputation.rank} sur ${stats.data.reputation.totalPlayers}`
                  : "Non classé"
              }
            />
            <StatCard
              icon={<Crosshair className="w-5 h-5" />}
              label="Captures"
              value={stats.data.captures.count.toLocaleString("fr-FR")}
              hint={
                stats.data.captures.count > 0
                  ? "Fois capturé"
                  : "Jamais capturé"
              }
            />
          </div>

          <section>
            <h2 className="font-serif text-lg font-semibold text-primary mb-4">
              Dernières captures
            </h2>
            {stats.data.captures.recent.length === 0 ? (
              <p className="text-foreground/50 text-sm">
                Aucune capture recensée pour l'instant.
              </p>
            ) : (
              <ul className="space-y-3">
                {stats.data.captures.recent.map((c, i) => (
                  <CaptureRow key={i} entry={c} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 text-primary mb-3">
        {icon}
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em]">
          {label}
        </span>
      </div>
      <p className="font-serif text-4xl font-bold text-foreground tracking-tight">
        {value}
      </p>
      <p className="text-foreground/50 text-sm mt-1">{hint}</p>
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
