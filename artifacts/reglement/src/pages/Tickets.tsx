import { useEffect, useState, useId } from "react";
import { Link, useSearch } from "wouter";
import {
  ArrowLeft,
  Ticket as TicketIcon,
  Plus,
  X,
  Loader2,
  Send,
  UserPlus,
  Trash2,
  CheckCircle2,
  RotateCcw,
  ShieldHalf,
  MessageSquare,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Gift,
  GraduationCap,
  Baby,
  Star,
  HelpCircle,
  Swords,
  Users,
  UserMinus,
} from "lucide-react";
import { FaDiscord } from "react-icons/fa6";
import {
  useAuth,
  useMyTickets,
  useFactionTickets,
  useArchivedTickets,
  useTicketDetail,
  useCreateTicket,
  useAddTicketMessage,
  useUploadTicketAttachment,
  useClaimTicket,
  useUnclaimTicket,
  useCloseTicket,
  useReopenTicket,
  useAddTicketParticipant,
  useRemoveTicketParticipant,
  useGeneralStaff,
  useAddGeneralStaff,
  useRemoveGeneralStaff,
  useMyProfile,
  type TicketEntry,
  type TicketAttachment,
} from "@/lib/use-auth";

const STATUS_LABELS: Record<TicketEntry["status"], string> = {
  open: "Ouvert",
  claimed: "Pris en charge",
  closed: "Fermé",
};

const STATUS_COLORS: Record<TicketEntry["status"], string> = {
  open: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  claimed: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  closed: "bg-white/10 text-foreground/50 border-white/10",
};

type Scope = "catalog" | "mine" | "archives" | "general" | { faction: string };

const TICKET_CATALOG = [
  {
    section: "Administration",
    types: [
      { key: "naissance-rp",  label: "Naissance RP",                 description: "Demander une naissance RP pour un personnage",               Icon: Baby          },
      { key: "traitrise",     label: "Traîtrise",                     description: "Demander une autorisation de traîtrise envers votre faction", Icon: Star          },
      { key: "ck",            label: "Demande de CK",                 description: "Demander un Character Kill pour un personnage ciblé",         Icon: Swords        },
      { key: "don",           label: "Demande de Don",                description: "Faire une demande de don en jeu",                            Icon: Gift          },
      { key: "classe",        label: "Demande de Classe",             description: "Demander un changement ou une attribution de classe",         Icon: GraduationCap },
    ],
  },
] as const;

const ALL_CATEGORY_LABELS: Record<string, string> = {
  ...Object.fromEntries(TICKET_CATALOG.flatMap((s) => s.types.map((t) => [t.key, t.label]))),
  question: "Plaintes/Demandes à mon gérant",
  plainte: "Plainte",
  demande: "Demande",
};

export default function Tickets() {
  const { user, isLoading: authLoading, login } = useAuth();
  const gerantFactions = user?.gerantFactions ?? [];
  const search = useSearch();
  const [scope, setScope] = useState<Scope>("catalog");
  const [openTicketId, setOpenTicketId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState<string | false>(false);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const idParam = params.get("id");
    if (idParam) {
      const id = Number(idParam);
      if (Number.isInteger(id)) setOpenTicketId(id);
    }
  }, [search]);

  const canSeeGeneral = !!(user?.isResponsable || user?.isGeneralStaff);
  const mine = useMyTickets(!!user && scope === "mine");
  const factionTickets = useFactionTickets(
    typeof scope === "object" ? scope.faction : null,
  );
  const generalTickets = useFactionTickets(canSeeGeneral && scope === "general" ? "Général" : null);
  const archived = useArchivedTickets(!!user?.isResponsable && scope === "archives");

  const list =
    scope === "mine" ? mine
    : scope === "archives" ? archived
    : scope === "general" ? generalTickets
    : factionTickets;

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
          Connecte-toi avec Discord pour accéder à tes tickets.
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

  const scopeTitle =
    scope === "catalog"
      ? "Toute les demandes"
      : scope === "mine"
        ? "Mes tickets"
        : scope === "archives"
          ? "Archives"
          : scope === "general"
            ? "Gestion Générale"
            : `Gestion · ${(scope as { faction: string }).faction}`;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      <Link
        href="/profil"
        className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors mb-6 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Mon profil</span>
      </Link>

      <header className="mb-6">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
          Ticket
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          {scopeTitle}
        </h1>
      </header>

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10 w-fit flex-wrap mb-8">
        <button
          type="button"
          onClick={() => setScope("catalog")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            scope === "catalog"
              ? "bg-primary/90 text-primary-foreground"
              : "text-foreground/60 hover:text-foreground"
          }`}
        >
          Toute les demandes
        </button>
        <button
          type="button"
          onClick={() => setScope("mine")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            scope === "mine"
              ? "bg-primary/90 text-primary-foreground"
              : "text-foreground/60 hover:text-foreground"
          }`}
        >
          Mes tickets
        </button>
        {gerantFactions.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setScope({ faction: f })}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              typeof scope === "object" && scope.faction === f
                ? "bg-primary/90 text-primary-foreground"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Gestion · {f}
          </button>
        ))}
        {canSeeGeneral && (
          <button
            type="button"
            onClick={() => setScope("general")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              scope === "general"
                ? "bg-primary/90 text-primary-foreground"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Gestion Générale
          </button>
        )}
        {user.isResponsable && (
          <button
            type="button"
            onClick={() => setScope("archives")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              scope === "archives"
                ? "bg-primary/90 text-primary-foreground"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Archives
          </button>
        )}
      </div>

      {/* Catalog view */}
      {scope === "catalog" && (
        <div className="space-y-10 animate-in fade-in duration-300">
          {TICKET_CATALOG.map(({ section, types }) => (
            <div key={section}>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.25em] text-foreground/40 mb-4">
                {section}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {types.map(({ key, label, description, Icon }) => (
                  <div
                    key={key}
                    className="flex flex-col gap-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] p-5 hover:border-primary/25 hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="font-bold text-foreground leading-tight">
                          {label}
                        </p>
                        <p className="text-[0.78rem] text-foreground/50 mt-0.5 leading-snug">
                          {description}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCreate(key)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.04] hover:border-primary/40 hover:bg-primary/10 hover:text-primary text-foreground/70 font-semibold px-4 py-2 text-sm transition-colors w-full"
                    >
                      Ouvrir un ticket
                    </button>
                  </div>
                ))}
                {user.faction && (
                  <div className="flex flex-col gap-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] p-5 hover:border-primary/25 hover:bg-white/[0.05] transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-5 h-5 text-primary" />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="font-bold text-foreground leading-tight">
                          Plaintes/Demandes à mon gérant
                        </p>
                        <p className="text-[0.78rem] text-foreground/50 mt-0.5 leading-snug">
                          Soumettre une plainte ou demande aux gérants de {user.faction}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCreate("question")}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.04] hover:border-primary/40 hover:bg-primary/10 hover:text-primary text-foreground/70 font-semibold px-4 py-2 text-sm transition-colors w-full"
                    >
                      Ouvrir un ticket
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket list (Mes tickets / Gestion / Archives / Gestion Générale) */}
      {scope !== "catalog" && (
        <>
          {scope === "mine" && (
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => setScope("catalog")}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 text-foreground/60 hover:text-foreground hover:border-white/20 font-semibold px-4 py-2 text-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Nouveau ticket
              </button>
            </div>
          )}

          {scope === "general" && user.isResponsable && (
            <GeneralStaffPanel />
          )}

          {list.isLoading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse"
                />
              ))}
            </div>
          )}

          {list.isError && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-foreground/80">
              Impossible de charger les tickets pour le moment.
            </div>
          )}

          {list.data && (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              {list.data.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-foreground/50">
                  Aucun ticket pour le moment.
                </p>
              ) : (
                <ul>
                  {list.data.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => setOpenTicketId(t.id)}
                        className="flex w-full items-center gap-3 px-4 py-3.5 border-b border-white/[0.04] last:border-b-0 text-left hover:bg-white/[0.03] transition-colors"
                      >
                        <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-4 h-4 text-primary" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground truncate">
                              {t.subject}
                            </span>
                            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] rounded-full bg-white/10 text-foreground/60 px-2 py-0.5">
                              {ALL_CATEGORY_LABELS[t.category] ?? t.category}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/45 truncate">
                            {t.faction} · {t.authorUsername}
                            {t.claimedByUsername
                              ? ` · pris par ${t.claimedByUsername}`
                              : ""}
                          </p>
                        </div>
                        <span
                          className={`text-[0.62rem] font-semibold uppercase tracking-[0.14em] rounded-full border px-2.5 py-1 shrink-0 ${STATUS_COLORS[t.status]}`}
                        >
                          {STATUS_LABELS[t.status]}
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

      {showCreate !== false && (
        <CreateTicketModal
          presetCategory={showCreate}
          onClose={() => setShowCreate(false)}
        />
      )}

      {openTicketId !== null && (
        <TicketDetailModal
          ticketId={openTicketId}
          currentUserId={user.id}
          onClose={() => setOpenTicketId(null)}
        />
      )}
    </div>
  );
}

const FACTIONS = ["Mangemort", "Auror", "Ministère", "Professeur", "Mage-Indépendant"] as const;
const STRUCTURED_CATEGORIES = ["don", "classe", "ck", "traitrise", "question"] as const;
type StructuredCategory = (typeof STRUCTURED_CATEGORIES)[number];

function isStructured(cat: string): cat is StructuredCategory {
  return (STRUCTURED_CATEGORIES as readonly string[]).includes(cat);
}

/* ── shared field primitives ── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-foreground/50 mb-1.5">
      {children}
    </label>
  );
}
const inputCls =
  "w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary/50 transition-colors";
const textareaCls =
  "w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary/50 transition-colors resize-none";
const selectCls =
  "w-full rounded-xl bg-[#111] border border-white/10 px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors";

function CreateTicketModal({
  presetCategory,
  onClose,
}: {
  presetCategory: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const profile = useMyProfile(true);
  const steamIdSaved = profile.data?.steamId ?? null;
  const create = useCreateTicket();
  const uid = useId();

  /* ── common ── */
  const [steamId, setSteamId] = useState("");
  const [nom, setNom] = useState("");
  const [faction, setFaction] = useState("");

  /* ── don ── */
  const [histoire, setHistoire] = useState("");
  const [pouvoir, setPouvoir] = useState("");
  const [connaissance, setConnaissance] = useState("");
  const [raison, setRaison] = useState("");
  const [utilisation, setUtilisation] = useState("");

  /* ── classe ── */
  const [roleClasse, setRoleClasse] = useState("");
  const [grade, setGrade] = useState("");
  const [pourquoiIdeal, setPourquoiIdeal] = useState("");
  const [definition, setDefinition] = useState("");
  const [adaptation, setAdaptation] = useState("");

  /* ── ck ── */
  const [cibleNom, setCibleNom] = useState("");
  const [cibleWl, setCibleWl] = useState("");
  const [histoireCk, setHistoireCk] = useState("");

  /* ── traitrise ── */
  const [raisonTrahison, setRaisonTrahison] = useState("");
  const [autreFaction, setAutreFaction] = useState("");
  const [apportRp, setApportRp] = useState("");

  /* ── question (plaintes/demandes gérant) ── */
  const [typeQuestion, setTypeQuestion] = useState("");
  const [descriptionQuestion, setDescriptionQuestion] = useState("");

  /* ── autre chose (optional, all structured) ── */
  const [autreChose, setAutreChose] = useState("");

  /* ── simple fallback (naissance-rp, question, …) ── */
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [error, setError] = useState<string | null>(null);

  const structured = isStructured(presetCategory);
  const modalTitle = ALL_CATEGORY_LABELS[presetCategory] ?? "Nouvelle demande";

  const discordLine = `${user?.displayName ?? ""}${user?.username ? ` (@${user.username})` : ""}`;
  const steamLine = steamIdSaved ?? (steamId.trim() || "Non renseigné");

  function buildBody(): string {
    const header = [
      `**Discord :** ${discordLine}`,
      `**SteamID :** ${steamLine}`,
      "",
      `**Prénom et Nom :** ${nom.trim()}`,
    ];

    const footer = autreChose.trim()
      ? ["", "**Autre chose :**", autreChose.trim()]
      : [];

    switch (presetCategory as StructuredCategory) {
      case "don":
        return [
          ...header,
          `**Faction :** ${faction}`,
          "",
          `**Pouvoir/Don demandé :** ${pouvoir.trim()}`,
          "",
          "**Histoire de votre personnage :**",
          histoire.trim(),
          "",
          "**Connaissance sur ce Pouvoir/Don :**",
          connaissance.trim(),
          "",
          "**Raison de l'obtention :**",
          raison.trim(),
          "",
          "**Utilisation en RP :**",
          utilisation.trim(),
          ...footer,
        ].join("\n");

      case "classe":
        return [
          ...header,
          `**Rôle demandé :** ${roleClasse}`,
          `**Faction :** ${faction}`,
          `**Grade actuel :** ${grade.trim()}`,
          "",
          "**Pourquoi êtes-vous la personne idéale pour ce rôle ?**",
          pourquoiIdeal.trim(),
          "",
          "**Définition et fonction de ce rôle dans votre faction :**",
          definition.trim(),
          "",
          "**Comment comptez-vous adapter votre RP à ce nouveau rôle ?**",
          adaptation.trim(),
          ...footer,
        ].join("\n");

      case "ck":
        return [
          ...header,
          `**Faction :** ${faction}`,
          "",
          `**Cible — Prénom et Nom :** ${cibleNom.trim()}`,
          `**Cible — Whitelist :** ${cibleWl.trim()}`,
          "",
          "**Histoire / Raison :**",
          histoireCk.trim(),
          ...footer,
        ].join("\n");

      case "traitrise":
        return [
          ...header,
          `**Faction :** ${faction}`,
          "",
          "**Pourquoi voulez-vous trahir votre Faction ?**",
          raisonTrahison.trim(),
          "",
          `**Comptez-vous aller dans une autre Faction ?** ${autreFaction.trim()}`,
          "",
          "**Celà va rajouter quoi à votre RP ?**",
          apportRp.trim(),
          ...footer,
        ].join("\n");

      case "question":
        return [
          ...header,
          `**Faction :** ${faction}`,
          `**Type :** ${typeQuestion}`,
          "",
          "**Description :**",
          descriptionQuestion.trim(),
          ...footer,
        ].join("\n");

      default:
        return body;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!structured) {
      if (!subject.trim() || !body.trim()) {
        setError("Merci de remplir le sujet et le message.");
        return;
      }
      create.mutate(
        { category: presetCategory, subject: subject.trim(), body: body.trim() },
        { onSuccess: onClose, onError: (err) => setError((err as Error).message) },
      );
      return;
    }

    /* Validate common */
    if (!nom.trim()) { setError("Merci d'indiquer ton Prénom et Nom RP."); return; }
    if (!faction) { setError("Merci de choisir ta faction."); return; }
    if (!steamIdSaved && !steamId.trim()) { setError("Merci d'indiquer ton SteamID."); return; }

    /* Validate per-type */
    if (presetCategory === "don" && (!histoire.trim() || !pouvoir.trim() || !connaissance.trim() || !raison.trim() || !utilisation.trim())) {
      setError("Merci de remplir tous les champs obligatoires."); return;
    }
    if (presetCategory === "classe" && (!roleClasse || !grade.trim() || !pourquoiIdeal.trim() || !definition.trim() || !adaptation.trim())) {
      setError("Merci de remplir tous les champs obligatoires."); return;
    }
    if (presetCategory === "ck" && (!cibleNom.trim() || !cibleWl.trim() || !histoireCk.trim())) {
      setError("Merci de remplir tous les champs obligatoires."); return;
    }
    if (presetCategory === "traitrise" && (!raisonTrahison.trim() || !autreFaction.trim() || !apportRp.trim())) {
      setError("Merci de remplir tous les champs obligatoires."); return;
    }
    if (presetCategory === "question" && (!typeQuestion || !descriptionQuestion.trim())) {
      setError("Merci de remplir tous les champs obligatoires."); return;
    }

    const autoSubject = `${modalTitle} — ${nom.trim()}`;
    create.mutate(
      { category: presetCategory, subject: autoSubject, body: buildBody() },
      { onSuccess: onClose, onError: (err) => setError((err as Error).message) },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-popover shadow-2xl shadow-black/60 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-white/10 sticky top-0 bg-popover z-10">
          <h2 className="font-serif text-xl font-bold text-foreground">{modalTitle}</h2>
          <button type="button" onClick={onClose} aria-label="Fermer"
            className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-white/5 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">

          {/* ── Discord (always readonly) ── */}
          <div>
            <FieldLabel>Profil Discord</FieldLabel>
            <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5">
              <FaDiscord className="w-4 h-4 text-[#5865F2] shrink-0" />
              <span className="text-sm text-foreground/70">{discordLine}</span>
            </div>
          </div>

          {/* ── SteamID ── */}
          <div>
            <FieldLabel>SteamID</FieldLabel>
            {steamIdSaved ? (
              <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5">
                <span className="text-sm font-mono text-foreground/70">{steamIdSaved}</span>
                <span className="ml-auto text-[0.65rem] text-foreground/35 uppercase tracking-wider">automatique</span>
              </div>
            ) : (
              <input
                id={`${uid}-steam`}
                type="text"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                placeholder="SteamID32 ou SteamID64"
                className={inputCls}
              />
            )}
          </div>

          {/* ── Champs simples (naissance-rp, question, …) ── */}
          {!structured && (
            <>
              <div>
                <FieldLabel>Sujet</FieldLabel>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                  placeholder="Sujet de ta demande" className={inputCls} />
              </div>
              <div>
                <FieldLabel>Message</FieldLabel>
                <textarea value={body} onChange={(e) => setBody(e.target.value)}
                  placeholder="Décris ta demande en détail…" rows={6} className={textareaCls} />
              </div>
            </>
          )}

          {/* ── Champs communs (structured) ── */}
          {structured && (
            <>
              <div>
                <FieldLabel>Prénom et Nom <span className="text-primary">*</span></FieldLabel>
                <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex : Jean Dupont" className={inputCls} />
              </div>

              {/* ── CLASSE : Rôle avant faction ── */}
              {presetCategory === "classe" && (
                <div>
                  <FieldLabel>Quel Rôle ? <span className="text-primary">*</span></FieldLabel>
                  <select value={roleClasse} onChange={(e) => setRoleClasse(e.target.value)} className={selectCls}>
                    <option value="">— Choisir un rôle —</option>
                    <option value="Erudit">Erudit</option>
                    <option value="Médicomage">Médicomage</option>
                  </select>
                </div>
              )}

              <div>
                <FieldLabel>Faction <span className="text-primary">*</span></FieldLabel>
                <select value={faction} onChange={(e) => setFaction(e.target.value)} className={selectCls}>
                  <option value="">— Choisir une faction —</option>
                  {FACTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* ── CLASSE : Grade ── */}
              {presetCategory === "classe" && (
                <div>
                  <FieldLabel>Quel est votre grade ? <span className="text-primary">*</span></FieldLabel>
                  <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)}
                    placeholder="Ex : Apprenti, Maître…" className={inputCls} />
                </div>
              )}

              {/* ── DON spécifique ── */}
              {presetCategory === "don" && (
                <>
                  <div>
                    <FieldLabel>Histoire de votre personnage <span className="text-primary">*</span></FieldLabel>
                    <textarea value={histoire} onChange={(e) => setHistoire(e.target.value)}
                      placeholder="Racontez l'histoire de votre personnage…" rows={4} className={textareaCls} />
                  </div>
                  <div>
                    <FieldLabel>Pouvoir/Don demandé <span className="text-primary">*</span></FieldLabel>
                    <input type="text" value={pouvoir} onChange={(e) => setPouvoir(e.target.value)}
                      placeholder="Quel pouvoir ou don souhaitez-vous ?" className={inputCls} />
                  </div>
                  <div>
                    <FieldLabel>Connaissance sur ce Pouvoir/Don <span className="text-primary">*</span></FieldLabel>
                    <textarea value={connaissance} onChange={(e) => setConnaissance(e.target.value)}
                      placeholder="Qu'est-ce que vous savez sur ce don ?" rows={3} className={textareaCls} />
                  </div>
                  <div>
                    <FieldLabel>Raison de l'obtention <span className="text-primary">*</span></FieldLabel>
                    <textarea value={raison} onChange={(e) => setRaison(e.target.value)}
                      placeholder="Pourquoi méritez-vous ce don ?" rows={3} className={textareaCls} />
                  </div>
                  <div>
                    <FieldLabel>Quel utilisation allez-vous en faire en RP ? <span className="text-primary">*</span></FieldLabel>
                    <textarea value={utilisation} onChange={(e) => setUtilisation(e.target.value)}
                      placeholder="Comment allez-vous l'utiliser en jeu ?" rows={3} className={textareaCls} />
                  </div>
                </>
              )}

              {/* ── CLASSE spécifique ── */}
              {presetCategory === "classe" && (
                <>
                  <div>
                    <FieldLabel>Pourquoi pensez-vous être la personne idéale pour ce rôle ? <span className="text-primary">*</span></FieldLabel>
                    <textarea value={pourquoiIdeal} onChange={(e) => setPourquoiIdeal(e.target.value)}
                      placeholder="Argumentez votre candidature…" rows={4} className={textareaCls} />
                  </div>
                  <div>
                    <FieldLabel>Quelle est la définition et la fonction de ce rôle dans votre faction ? <span className="text-primary">*</span></FieldLabel>
                    <textarea value={definition} onChange={(e) => setDefinition(e.target.value)}
                      placeholder="Selon vous, quel est le rôle de cet Erudit / Médicomage ?" rows={4} className={textareaCls} />
                  </div>
                  <div>
                    <FieldLabel>Comment comptez-vous adapter votre RP à ce nouveau rôle ? <span className="text-primary">*</span></FieldLabel>
                    <textarea value={adaptation} onChange={(e) => setAdaptation(e.target.value)}
                      placeholder="Comment allez-vous incarner ce rôle ?" rows={4} className={textareaCls} />
                  </div>
                </>
              )}

              {/* ── CK spécifique ── */}
              {presetCategory === "ck" && (
                <>
                  <div>
                    <FieldLabel>Prénom et Nom de la personne visée <span className="text-primary">*</span></FieldLabel>
                    <input type="text" value={cibleNom} onChange={(e) => setCibleNom(e.target.value)}
                      placeholder="Prénom Nom de la cible" className={inputCls} />
                  </div>
                  <div>
                    <FieldLabel>Sa Whitelist ? <span className="text-primary">*</span></FieldLabel>
                    <input type="text" value={cibleWl} onChange={(e) => setCibleWl(e.target.value)}
                      placeholder="Ex : Mangemort, Auror…" className={inputCls} />
                  </div>
                  <div>
                    <FieldLabel>L'histoire / Raison qui a mené à cette demande <span className="text-primary">*</span></FieldLabel>
                    <textarea value={histoireCk} onChange={(e) => setHistoireCk(e.target.value)}
                      placeholder="Expliquez le contexte RP détaillé…" rows={5} className={textareaCls} />
                  </div>
                </>
              )}

              {/* ── TRAITRISE spécifique ── */}
              {presetCategory === "traitrise" && (
                <>
                  <div>
                    <FieldLabel>Pourquoi voulez-vous trahir votre Faction ? <span className="text-primary">*</span></FieldLabel>
                    <textarea value={raisonTrahison} onChange={(e) => setRaisonTrahison(e.target.value)}
                      placeholder="Expliquez vos motivations RP…" rows={4} className={textareaCls} />
                  </div>
                  <div>
                    <FieldLabel>Comptez-vous aller dans une autre Faction ? <span className="text-primary">*</span></FieldLabel>
                    <input type="text" value={autreFaction} onChange={(e) => setAutreFaction(e.target.value)}
                      placeholder="Oui (laquelle ?) ou Non" className={inputCls} />
                  </div>
                  <div>
                    <FieldLabel>Celà va rajouter quoi à votre RP ? <span className="text-primary">*</span></FieldLabel>
                    <textarea value={apportRp} onChange={(e) => setApportRp(e.target.value)}
                      placeholder="Quel apport cette trahison apporte-t-elle à votre personnage ?" rows={4} className={textareaCls} />
                  </div>
                </>
              )}

              {/* ── QUESTION spécifique ── */}
              {presetCategory === "question" && (
                <>
                  <div>
                    <FieldLabel>Type <span className="text-primary">*</span></FieldLabel>
                    <select value={typeQuestion} onChange={(e) => setTypeQuestion(e.target.value)} className={selectCls}>
                      <option value="">— Plainte ou Demande ? —</option>
                      <option value="Plainte">Plainte</option>
                      <option value="Demande">Demande</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Description <span className="text-primary">*</span></FieldLabel>
                    <textarea value={descriptionQuestion} onChange={(e) => setDescriptionQuestion(e.target.value)}
                      placeholder="Explique la situation en détail…" rows={5} className={textareaCls} />
                  </div>
                </>
              )}

              {/* ── Autre chose (optionnel) ── */}
              <div>
                <FieldLabel>Autre chose ? <span className="text-foreground/30 font-normal normal-case tracking-normal">(optionnel)</span></FieldLabel>
                <textarea value={autreChose} onChange={(e) => setAutreChose(e.target.value)}
                  placeholder="Toute information complémentaire…" rows={3} className={textareaCls} />
              </div>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button type="submit" disabled={create.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground font-semibold px-5 py-2.5 text-sm transition-colors disabled:opacity-50">
            {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}

function TicketDetailModal({
  ticketId,
  currentUserId,
  onClose,
}: {
  ticketId: number;
  currentUserId: string;
  onClose: () => void;
}) {
  const detail = useTicketDetail(ticketId);
  const addMessage = useAddTicketMessage(ticketId);
  const uploadAttachment = useUploadTicketAttachment(ticketId);
  const claim = useClaimTicket(ticketId);
  const unclaim = useUnclaimTicket(ticketId);
  const close = useCloseTicket(ticketId);
  const reopen = useReopenTicket(ticketId);
  const addParticipant = useAddTicketParticipant(ticketId);
  const removeParticipant = useRemoveTicketParticipant(ticketId);

  const [reply, setReply] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<TicketAttachment[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [participantId, setParticipantId] = useState("");
  const [participantLabel, setParticipantLabel] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const ticket = detail.data?.ticket ?? null;
  const isStaff = detail.data?.isStaff ?? false;
  const canManage = isStaff && ticket?.status !== "closed";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    uploadAttachment.mutate(file, {
      onSuccess: (attachment) => {
        setPendingAttachments((prev) => [...prev, attachment]);
      },
      onError: (err) => setUploadError((err as Error).message),
    });
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() && pendingAttachments.length === 0) return;
    addMessage.mutate(
      { body: reply.trim(), attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined },
      {
        onSuccess: () => {
          setReply("");
          setPendingAttachments([]);
          setUploadError(null);
        },
      },
    );
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!/^\d{15,25}$/.test(participantId.trim())) {
      setActionError("L'identifiant Discord doit contenir uniquement des chiffres (15 à 25).");
      return;
    }
    addParticipant.mutate(
      {
        discordId: participantId.trim(),
        label: participantLabel.trim() || undefined,
      },
      {
        onSuccess: () => {
          setParticipantId("");
          setParticipantLabel("");
          setShowAddParticipant(false);
        },
        onError: (err) => setActionError((err as Error).message),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-popover shadow-2xl shadow-black/60 animate-in slide-in-from-bottom-4 duration-300 max-h-[88vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-white/10 sticky top-0 bg-popover z-10">
          <div className="min-w-0">
            {ticket && (
              <>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  {ticket.faction} · {ticket.category}
                </p>
                <h2 className="font-serif text-xl font-bold text-foreground truncate">
                  {ticket.subject}
                </h2>
              </>
            )}
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

        {detail.isLoading && (
          <div className="p-5 space-y-3">
            <div className="h-16 rounded-xl bg-white/[0.04] border border-white/10 animate-pulse" />
            <div className="h-16 rounded-xl bg-white/[0.04] border border-white/10 animate-pulse" />
          </div>
        )}

        {detail.isError && (
          <div className="p-5">
            <p className="text-sm text-destructive">
              Impossible de charger ce ticket (accès refusé ou introuvable).
            </p>
          </div>
        )}

        {detail.data && ticket && (
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[0.62rem] font-semibold uppercase tracking-[0.14em] rounded-full border px-2.5 py-1 ${STATUS_COLORS[ticket.status]}`}
              >
                {STATUS_LABELS[ticket.status]}
              </span>
              {ticket.claimedByUsername && (
                <span className="text-xs text-foreground/50">
                  Pris en charge par {ticket.claimedByUsername}
                </span>
              )}

              {canManage && (
                <div className="flex items-center gap-2 ml-auto flex-wrap">
                  {ticket.status === "open" && (
                    <ActionButton
                      icon={<ShieldHalf className="w-3.5 h-3.5" />}
                      label="Prendre en charge"
                      onClick={() => claim.mutate()}
                      loading={claim.isPending}
                    />
                  )}
                  {ticket.status === "claimed" && (
                    <ActionButton
                      icon={<RotateCcw className="w-3.5 h-3.5" />}
                      label="Libérer"
                      onClick={() => unclaim.mutate()}
                      loading={unclaim.isPending}
                    />
                  )}
                  <ActionButton
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    label="Fermer"
                    onClick={() => close.mutate()}
                    loading={close.isPending}
                    variant="destructive"
                  />
                </div>
              )}
              {isStaff && ticket.status === "closed" && (
                <ActionButton
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  label="Rouvrir"
                  onClick={() => reopen.mutate()}
                  loading={reopen.isPending}
                />
              )}
            </div>

            <div className="space-y-3">
              {detail.data.messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl border px-4 py-3 ${
                    m.authorId === currentUserId
                      ? "border-primary/30 bg-primary/10 ml-6"
                      : "border-white/10 bg-white/[0.02] mr-6"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">
                      {m.authorUsername}
                    </span>
                    {m.isStaff && (
                      <span className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] rounded-full bg-primary/15 text-primary px-2 py-0.5">
                        Gérant
                      </span>
                    )}
                    <span className="text-[0.68rem] text-foreground/40 ml-auto">
                      {new Date(m.createdAt).toLocaleString("fr-FR")}
                    </span>
                  </div>
                  {m.body && m.body !== "📎" && (
                    <p className="text-sm text-foreground/85 whitespace-pre-wrap">
                      {m.body}
                    </p>
                  )}
                  {m.attachments && m.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.attachments.map((att, i) => (
                        <AttachmentPreview key={i} attachment={att} apiBase={import.meta.env["VITE_API_URL"] ?? ""} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {ticket.status !== "closed" && (
              <div className="space-y-2">
                {/* Pending attachments */}
                {pendingAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {pendingAttachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1.5 text-xs">
                        <Paperclip className="w-3 h-3 text-primary/70" />
                        <span className="text-foreground/70 max-w-[120px] truncate">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => setPendingAttachments((prev) => prev.filter((_, j) => j !== i))}
                          className="text-foreground/40 hover:text-destructive transition-colors"
                          aria-label="Retirer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {uploadError && (
                  <p className="text-xs text-destructive">{uploadError}</p>
                )}
                <form onSubmit={handleSendReply} className="flex items-center gap-2">
                  {/* File attachment input */}
                  <label className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shrink-0 transition-colors ${
                    uploadAttachment.isPending
                      ? "opacity-50 cursor-not-allowed"
                      : "text-foreground/40 hover:text-primary hover:bg-primary/10"
                  }`} aria-label="Joindre un fichier">
                    {uploadAttachment.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Paperclip className="w-4 h-4" />
                    )}
                    <input
                      type="file"
                      className="sr-only"
                      disabled={uploadAttachment.isPending}
                      onChange={handleFileSelect}
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.mp4,.mov,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx"
                    />
                  </label>
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Écrire une réponse…"
                    className="flex-1 rounded-full bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={addMessage.isPending || (!reply.trim() && pendingAttachments.length === 0)}
                    className="w-10 h-10 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
                    aria-label="Envoyer"
                  >
                    {addMessage.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            )}

            {isStaff && (
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif text-sm font-semibold text-primary">
                    Participants
                  </h3>
                  {ticket.status !== "closed" && (
                    <button
                      type="button"
                      onClick={() => setShowAddParticipant((v) => !v)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Ajouter
                    </button>
                  )}
                </div>
                <p className="text-xs text-foreground/50 mb-3">
                  Ajoute un gérant d'une autre faction ou un joueur par son
                  identifiant Discord pour lui donner accès à ce ticket.
                </p>

                {showAddParticipant && (
                  <form
                    onSubmit={handleAddParticipant}
                    className="flex flex-col sm:flex-row gap-2 mb-3"
                  >
                    <input
                      type="text"
                      inputMode="numeric"
                      value={participantId}
                      onChange={(e) => setParticipantId(e.target.value)}
                      placeholder="Identifiant Discord"
                      className="flex-1 rounded-full bg-white/[0.04] border border-white/10 px-4 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <input
                      type="text"
                      value={participantLabel}
                      onChange={(e) => setParticipantLabel(e.target.value)}
                      placeholder="Nom (facultatif)"
                      className="sm:w-40 rounded-full bg-white/[0.04] border border-white/10 px-4 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={addParticipant.isPending}
                      className="rounded-full bg-primary/90 hover:bg-primary text-primary-foreground font-semibold px-4 py-2 text-sm transition-colors disabled:opacity-50 shrink-0"
                    >
                      Ajouter
                    </button>
                  </form>
                )}
                {actionError && (
                  <p className="text-sm text-destructive mb-3">{actionError}</p>
                )}

                {detail.data.participants.length === 0 ? (
                  <p className="text-xs text-foreground/40">
                    Aucun participant ajouté.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {detail.data.participants.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2"
                      >
                        <span className="text-sm text-foreground flex-1 truncate">
                          {p.label || `Utilisateur ${p.discordId.slice(-4)}`}
                        </span>
                        <span className="text-xs text-foreground/40 font-mono">
                          {p.discordId}
                        </span>
                        {ticket.status !== "closed" && (
                          <button
                            type="button"
                            onClick={() => removeParticipant.mutate(p.discordId)}
                            aria-label="Retirer"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Attachment preview ───────────────────────────────────────────────────────

function AttachmentPreview({
  attachment,
  apiBase,
}: {
  attachment: TicketAttachment;
  apiBase: string;
}) {
  const isImage = /^image\//.test(attachment.type);
  const url = `${apiBase}${attachment.url}`;

  if (isImage) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg overflow-hidden border border-white/10 hover:border-primary/40 transition-colors max-w-[200px]"
      >
        <img
          src={url}
          alt={attachment.name}
          className="max-h-40 w-full object-cover"
        />
        <p className="text-[0.65rem] text-foreground/50 px-2 py-1 truncate">
          {attachment.name}
        </p>
      </a>
    );
  }

  const isPdf = attachment.type === "application/pdf";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] hover:border-primary/40 transition-colors px-3 py-2"
    >
      {isPdf ? (
        <FileText className="w-4 h-4 text-primary/70 shrink-0" />
      ) : (
        <Paperclip className="w-4 h-4 text-foreground/50 shrink-0" />
      )}
      <div className="min-w-0">
        <p className="text-xs text-foreground/80 truncate max-w-[180px]">{attachment.name}</p>
        <p className="text-[0.6rem] text-foreground/40">
          {(attachment.size / 1024).toFixed(0)} Ko
        </p>
      </div>
    </a>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  loading,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  loading: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
        variant === "destructive"
          ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
          : "bg-primary/15 text-primary hover:bg-primary/25"
      }`}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {label}
    </button>
  );
}

function GeneralStaffPanel() {
  const staff = useGeneralStaff(true);
  const addStaff = useAddGeneralStaff();
  const removeStaff = useRemoveGeneralStaff();
  const [newId, setNewId] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{15,25}$/.test(newId.trim())) {
      setError("L'ID Discord doit contenir uniquement des chiffres (15 à 25 caractères).");
      return;
    }
    addStaff.mutate(
      { discordId: newId.trim(), label: newLabel.trim() || undefined },
      {
        onSuccess: () => {
          setNewId("");
          setNewLabel("");
          setShowForm(false);
        },
        onError: (err) => setError((err as Error).message),
      },
    );
  };

  return (
    <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/[0.04] p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <p className="text-sm font-bold text-foreground">Staff Général</p>
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] rounded-full bg-white/10 text-foreground/50 px-2 py-0.5">
            {staff.data?.length ?? 0} membre{(staff.data?.length ?? 0) !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm((v) => !v); setError(null); }}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 hover:bg-primary/25 text-primary font-semibold px-3 py-1.5 text-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="ID Discord (chiffres uniquement)"
              className="flex-1 min-w-0 rounded-full bg-white/[0.04] border border-white/10 px-4 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
            />
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Nom (optionnel)"
              className="w-40 rounded-full bg-white/[0.04] border border-white/10 px-4 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button
              type="submit"
              disabled={addStaff.isPending}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground font-semibold px-4 py-2 text-sm transition-colors disabled:opacity-50"
            >
              {addStaff.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Ajouter
            </button>
          </div>
          {error && <p className="text-xs text-destructive px-1">{error}</p>}
        </form>
      )}

      {staff.isLoading && (
        <div className="h-10 rounded-xl bg-white/[0.04] animate-pulse" />
      )}

      {staff.data && staff.data.length === 0 && !showForm && (
        <p className="text-xs text-foreground/40">
          Aucun membre dans le staff général. Ajoutez des personnes pour qu'elles puissent gérer les demandes.
        </p>
      )}

      {staff.data && staff.data.length > 0 && (
        <ul className="space-y-1.5">
          {staff.data.map((s) => (
            <li
              key={s.discordId}
              className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {s.label ?? s.discordId}
                </p>
                {s.label && (
                  <p className="text-[0.7rem] text-foreground/40 font-mono">{s.discordId}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeStaff.mutate(s.discordId)}
                disabled={removeStaff.isPending}
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                aria-label="Retirer"
              >
                <UserMinus className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
