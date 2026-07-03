import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSearch } from "@/lib/search-context";

function Example({ children }: { children: ReactNode }) {
  return (
    <div className="border-l-2 border-border bg-secondary/30 px-4 py-3 rounded-sm text-[0.98rem]">
      <span className="eyebrow text-[0.68rem] text-foreground/60 mr-2">Exemple</span>
      {children}
    </div>
  );
}

function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="border-l-2 border-primary bg-primary/[0.06] px-4 py-3 rounded-sm">
      <span className="eyebrow text-[0.68rem] text-primary block mb-1">Attention</span>
      <div className="text-foreground/80">{children}</div>
    </div>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h4 className="font-serif text-lg font-semibold text-foreground border-b border-border pb-1.5">
      {children}
    </h4>
  );
}

type Section = {
  value: string;
  num: string;
  title: string;
  keywords: string;
  body: ReactNode;
};

const sections: Section[] = [
  {
    value: "item-1",
    num: "I",
    title: "Fiche de suivie",
    keywords: "fiche de suivie suivi ck",
    body: (
      <>
        <p>Un système suivie a été mis en place est obligatoire pour tout membre de faction, il s'agit tout simplement de votre fiche personnelle ou seront inscrit : vos informations RP, vos interactions RP, votre histoire, vos dons et toutes informations complémentaires.</p>
        <p>Ce système est mit en place pour seconder le système de CK qui prend désormais la place du système de capture, pour résumer, vous devrez noter sous forme de résumé très court les interactions que vous aurez avec un autre personnage, qu'elles soient positive comme négative.</p>
        <p>Ainsi pour vos demandes futurs nous aurons une potentielle trace de vos agissements et donc une meilleures gestion et rapidité de traitement !</p>
        <p className="text-primary italic">Nous vous invitons à le prendre au premier degrés, car toutes informations que vous oublierez ne pourront être comptées !</p>
      </>
    ),
  },
  {
    value: "item-2",
    num: "II",
    title: "Le FearRP",
    keywords: "le fearrp peur fear",
    body: (
      <>
        <p>Le FearRP est "le jeu de la peur". Lorsque l'occasion se présente, vous devez absolument avoir peur. Rappelez-vous que vous incarnez un personnage et qu'il n'a qu'une seule vie ! Si sa vie est en danger, vous devez obligatoirement respecter la peur de mourir.</p>
        <Example>
          Vous ne pouvez pas fuir lorsqu'un Mangemort vous pointe avec sa baguette magique puisqu'il a juste à prononcer l'incantation pour vous tuer, si vous avez le malheur de bouger. Vous n'êtes pas immortel comme l'a été Nicolas Flamel !
        </Example>
        <Warning>
          Le FearRP ne comprend pas uniquement la "peur de mourir" mais également la peur d'une sanction. Il s'applique donc également aux interactions avec les Préfets, Professeurs, Aurors, Membres du ministère, Directeur, etc. Attention à bien faire des choix logiques et respectant le RolePlay. Désormais, en cas de NoFear face à des personnes de faction, si celles-ci jugent que votre Fear n'est pas assez présent et que vous faites preuve de NoFear, cela pourra mener à un CK direct de votre personnage sur scène, suite à un support afin d'apporter les différents points de vue.
        </Warning>
      </>
    ),
  },
  {
    value: "item-3",
    num: "III",
    title: "Le PainRP",
    keywords: "le painrp douleur pain",
    body: (
      <>
        <p>Le PainRP est le "jeu de la douleur" dans le RolePlay. Comme son nom l'indique, vous devez respecter le jeu de la douleur en la simulant lorsque la situation se présente. Vous ne pouvez pas, par exemple, faire comme si de rien n'était alors que vous avez reçu un Endoloris (Le Sortilège Doloris est l'un des trois Sortilèges Impardonnables). Il y a des conséquences mentales et physiques derrière.</p>
        <p>Désormais, pour que les choses soient plus claires dans l'esprit de tout le monde, un Auror, Mangemort, Professeur, membre du Ministère, Mage indépendant, Vampire ou Élève passant sous le seuil des 30 HP ou l'égalant, ne pourra plus faire usage de sortilèges, ne pourra plus courir et devra simplement trotter ACCROUPI en espérant recevoir de l'aide de ses alliés, se cacher afin de semer les opposants ou bien se rendre.</p>
      </>
    ),
  },
  {
    value: "item-4",
    num: "IV",
    title: "NLR (New Life Rule)",
    keywords: "nlr new life rule mort coma",
    body: (
      <>
        <p>La New Life Rule (NLR) entre en vigueur après la mort ou un coma IC. Lorsqu'un personnage est vaincu en combat, il ne meurt pas réellement ; il est transporté, de manière passive, à l'infirmerie ou à l'hôpital pour recevoir des soins. Il est strictement interdit de revenir sur les lieux de votre mort pour chercher vengeance.</p>
        <Warning>
          Il est interdit de revenir sur la scène ayant provoqué votre mort, interdiction donc d'y revenir tant qu'elle n'est pas finie, généralement un "/advert" ou un message dans le chat pour vous avertir de la fin de celle-ci.
        </Warning>
        <Example>
          Vous êtes impliqué dans un combat contre un Mangemort et vous êtes vaincu. Conformément à la NLR, vous ne devez pas retourner sur le champ de bataille pour vous venger. Au lieu de cela, vous devez jouer une scène de RP où votre personnage se réveille à l'infirmerie, reçoit des soins et se remet progressivement de ses blessures.
        </Example>
      </>
    ),
  },
  {
    value: "item-5",
    num: "V",
    title: "Le FairPlay",
    keywords: "le fairplay fair play",
    body: (
      <>
        <p>Assurez vous que les scènes soient menés avec respect et bienséance. Favorisez des interactions qui enrichissent l'expérience de jeu pour toutes les factions, en mettant l'accent sur des scénarios créatifs et intéressants pour tout le monde.</p>
        <Example>
          Vous êtes en négociation et vous êtes en surnombre comparé a vos opposants face à vous, vous devez laisser des portes de sortie a la factions en minorité.
        </Example>
        <p className="text-primary italic">Attention, cela n'interdit pas que vous pouvez mener un combat si la scène tourne au "vinaigre".</p>
      </>
    ),
  },
  {
    value: "item-6",
    num: "VI",
    title: "Les Temps de RP",
    keywords: "les temps de rp couvre feu horaires temps",
    body: (
      <>
        <p>Afin de garder une exclusivité aux scènes, une gestion plus accrue avec d'avantage d'observation sur vos agissements et donc un meilleur Gameplay pour vous, nous avons, la gérance, votés pour instaurer un couvre feu a fenêtre très large. Le couvre feu a pour But de minimiser les scènes RP faites à l'arrache sans réel but derrière et donc favoriser les heures de pointes avec d'avantages de mondes et de propositions.</p>
        <ul className="list-disc list-outside pl-5 space-y-2 marker:text-primary">
          <li><strong className="text-foreground">En semaine (Lundi-Jeudi) :</strong> de 17h à 1h du matin</li>
          <li><strong className="text-foreground">En Week-end (Vendredi-Dimanche) :</strong> 16h a 2h du matin</li>
        </ul>
        <p>Pendant la tranche horaire de couvre feu (1h01/2h01 à 11h59) il est interdit de jouer <strong className="text-primary">QUELCONQUE INTERACTIONS</strong> en membre de faction, que ce soit d'une simple capture d'un élève à une entrevue entre différentes factions. Il est autorisé néanmoins de faire des scènes entre membre d'une même faction, qui ne crée aucun conflit extérieur, style entraînement/cours...</p>
      </>
    ),
  },
  {
    value: "item-7",
    num: "VII",
    title: "Les Sanctions",
    keywords: "les sanctions drapeau rouge noir hrp rp staff",
    body: (
      <div className="space-y-6">
        <p>Au sein d'une faction, plusieurs types de sanctions peuvent être appliqués selon la nature de la faute (RP ou HRP). Voici un récapitulatif :</p>

        <div className="space-y-3">
          <SubHeading>Sanctions RP</SubHeading>
          <ul className="list-disc list-outside pl-5 space-y-1 marker:text-primary">
            <li>Ces sanctions sont décidées par un supérieur hiérarchique RP.</li>
            <li>Elles ont une portée uniquement roleplay et doivent être jouées en conséquence.</li>
            <li>Elles peuvent également être levées par un supérieur RP.</li>
          </ul>
          <Example>
            "Tu es sanctionné pour ton comportement, tu dois nettoyer l'ensemble du Ministère."
          </Example>
        </div>

        <div className="space-y-3">
          <SubHeading>Sanctions HRP</SubHeading>
          <p>Ces sanctions sont plus graves car elles concernent le comportement hors roleplay. Elles sont infligées par votre gérant de faction et fonctionnent par palier :</p>
          <ul className="list-disc list-outside pl-5 space-y-1 marker:text-primary">
            <li><strong className="text-foreground">1 / 2 / 3 :</strong> Chaque croix représente un avertissement officiel.</li>
            <li>À la 3e croix, vous perdez automatiquement votre rôle dans la faction.</li>
          </ul>
        </div>

        <div className="border-l-2 border-primary bg-primary/[0.06] px-4 py-3 rounded-sm space-y-2">
          <h4 className="font-serif text-lg font-semibold text-primary">Le Drapeau Rouge</h4>
          <ul className="list-disc list-outside pl-5 space-y-1 marker:text-primary text-foreground/80">
            <li>Sanction exceptionnelle décidée par un conseil regroupant votre gérant de faction et un Super Admin.</li>
            <li>Cela signifie que si vous êtes capturé, votre vie est en jeu.</li>
            <li>Le gérant de la faction vous ayant capturé pourra demander un CK immédiat, sans avoir à faire de requête.</li>
          </ul>
        </div>

        <div className="border-l-2 border-primary bg-primary/[0.1] px-4 py-3 rounded-sm space-y-2">
          <h4 className="font-serif text-lg font-bold text-primary">Le Drapeau Noir</h4>
          <ul className="list-disc list-outside pl-5 space-y-1 marker:text-primary text-foreground/90">
            <li>Sanction extrême, infligée uniquement par un Super Admin.</li>
            <li>Elle signifie que votre vie est systématiquement en danger lors de tout combat RP.</li>
            <li>Si vous tombez au combat, vous serez automatiquement CK, sans discussion.</li>
            <li>Si vous tentez d'ésquivez cette sanction par un moyen visible, vous serez automatiquement CK.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <SubHeading>Sanction Staff</SubHeading>
          <ul className="list-disc list-outside pl-5 space-y-1 marker:text-primary">
            <li>Le staff peut vous sanctionner en cas d'infraction au règlement du serveur, même en dehors du cadre RP.</li>
            <li>En cas de sanction, votre gérant de faction sera immédiatement prévenu.</li>
            <li>L'Administration (Admin, Super Admin…) se réserve le droit d'appliquer des sanctions sévères si une faute dépasse les compétences du staff ou de votre gérant.</li>
            <li>Ces décisions sont souveraines et peuvent entraîner des bannissements ou exclusions définitives de votre faction ou du serveur.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    value: "item-8",
    num: "VIII",
    title: "Les élèves",
    keywords: "les eleves eleves capture foret quidditch",
    body: (
      <div className="space-y-6">
        <div className="space-y-3">
          <SubHeading>Capture en Forêt</SubHeading>
          <p>Les factions Vampire et Mangemort sont autorisées à capturer des élèves en Forêt, uniquement dans un cadre RP justifié.</p>
          <p>Une capture est autorisée si au moins l'une des conditions suivantes est remplie :</p>
          <ul className="list-disc list-outside pl-5 space-y-1 marker:text-primary">
            <li>L'élève adopte un comportement agressif, provocateur ou un NoFear manifeste ;</li>
            <li>L'élève interfère volontairement avec une action RP de la faction ;</li>
            <li>La faction est explicitement à la recherche d'un élève précis dans le cadre d'une mission, d'un ordre hiérarchique ou d'un Ordre de Capture.</li>
          </ul>
          <p>En revanche, il est strictement interdit de capturer un élève :</p>
          <ul className="list-disc list-outside pl-5 space-y-1 marker:text-primary">
            <li>se promenant calmement en forêt ;</li>
            <li>chassant ou prenant l'air sans comportement agressif ;</li>
            <li>respectant le Fear RP et n'interagissant pas avec la faction.</li>
          </ul>
          <p className="text-primary italic">Toute capture sans justification RP valable sera considérée comme un abus / WinRP et pourra être sanctionnée.</p>
        </div>

        <div className="border-l-2 border-primary bg-primary/[0.06] px-4 py-3 rounded-sm space-y-2">
          <h4 className="font-serif text-lg font-semibold text-primary">Capture au Terrain de Quidditch</h4>
          <p className="text-foreground/85">Les captures d'élèves au Terrain de Quidditch sont strictement interdites, sans exception.</p>
          <p className="text-foreground/85">De plus :</p>
          <ul className="list-disc list-outside pl-5 space-y-1 marker:text-primary text-foreground/80">
            <li>L'accès au Terrain de Quidditch est interdit à toute personne en dessous du grade de Membre du Conseil/Commandant Auror/Emissaire du Sang ;</li>
            <li>Toute présence non autorisée ou tentative de capture dans cette zone sera sanctionnée.</li>
          </ul>
        </div>
      </div>
    ),
  },
];

export default function Home() {
  const { query } = useSearch();
  const q = query.trim().toLowerCase();
  const visible = (s: Section) =>
    q === "" || s.keywords.includes(q) || s.title.toLowerCase().includes(q);
  const shown = sections.filter(visible);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Title */}
      <header className="mb-10">
        <div className="eyebrow text-[0.72rem] text-primary mb-3">
          Ministère de la Magie · Règlement
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-serif font-bold text-foreground tracking-tight leading-[1.05] letterpress">
          Règlement spécifique au RP
        </h1>
        <div className="mt-5 flex items-center gap-3">
          <span className="h-px w-16 bg-primary" />
          <span className="h-px flex-1 bg-border" />
        </div>
      </header>

      {/* Intro — pull quote */}
      <div className="mb-12 border-l-2 border-primary pl-6 py-1">
        <p className="text-foreground/80 leading-[1.8] text-[1.02rem]">
          <span className="text-primary font-semibold">Ce règlement est considéré comme lu et approuvé par toutes et tous.</span> Des sanctions peuvent donc vous être appliquées si celui-ci est enfreint. Le règlement de faction doit être connu et appris par tous les joueurs souhaitant s'immiscer dans un RP dit 'plus sérieux'. Aucune dérogation aux règles ne sera tolérée, de plus chaque erreur commise sera sanctionnée d'un avertissement 'Faction'. Un avertissement 'Faction' équivaut à une probable rétrogradation directe du poste en question suivie d'une exclusion de la faction pour une durée de 2 mois. Avant tout, il est interdit de faire son propre règlement, si une précision n'est pas inscrite sur ce règlement elle est automatiquement interdite jusqu'à discussion de celle-ci en réunion STAFF.
        </p>
      </div>

      {/* Decree list */}
      <Accordion
        type="single"
        collapsible
        className="w-full border-t border-border"
      >
        {shown.map((s) => (
          <AccordionItem
            key={s.value}
            value={s.value}
            className="border-b border-border"
          >
            <AccordionTrigger className="py-5 hover:no-underline group data-[state=open]:text-primary [&>svg]:text-muted-foreground [&>svg]:group-hover:text-primary">
              <div className="flex items-baseline gap-5 text-left">
                <span className="font-serif text-lg text-primary/70 group-data-[state=open]:text-primary w-10 shrink-0 tabular-nums tracking-wide">
                  {s.num}
                </span>
                <span className="font-serif text-xl md:text-2xl font-semibold tracking-tight text-foreground group-hover:text-primary group-data-[state=open]:text-primary transition-colors">
                  {s.title}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-8 pt-1">
              <div className="ml-0 md:ml-[3.75rem] border-l border-border/60 pl-6 text-foreground/75 leading-[1.75] space-y-4">
                {s.body}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {shown.length === 0 && (
        <div className="text-center text-muted-foreground py-16 italic">
          Aucune règle ne correspond à votre recherche.
        </div>
      )}
    </div>
  );
}
