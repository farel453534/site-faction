import React from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ChevronRight, Menu, Discord, Home as HomeIcon, ScrollText, User, Users, BookOpen } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import { SiRoblox } from "react-icons/si";

export default function Home() {
  return (
    <div className="flex h-screen w-full bg-background bg-texture overflow-hidden selection:bg-primary/30 selection:text-primary">
      
      {/* Sidebar */}
      <aside className="w-16 border-r border-border bg-sidebar flex flex-col items-center py-6 gap-8 z-20 shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary red-glow">
          <BookOpen className="w-5 h-5" />
        </div>
        <nav className="flex flex-col gap-6 w-full items-center mt-4">
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <HomeIcon className="w-5 h-5" />
          </button>
          <button className="text-primary transition-colors border-r-2 border-primary w-full flex justify-center">
            <ScrollText className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <User className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <Users className="w-5 h-5" />
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Background gradient effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-red-900/10 blur-[150px] rounded-full" />
        </div>

        {/* Topbar */}
        <header className="h-20 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input 
                type="search" 
                placeholder="Recherche réservée au staff..." 
                className="w-64 bg-secondary/50 border border-border rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-border pr-6">
              <a href="https://discord.gg/mssclick" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium">
                <FaDiscord className="w-5 h-5" />
                <span className="hidden sm:inline">Discord</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium">
                <SiRoblox className="w-4 h-4" />
                <span className="hidden sm:inline">Site du Ministère</span>
              </a>
            </div>
            <button className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground px-6 py-2 rounded-md text-sm font-semibold transition-all red-glow uppercase tracking-wider">
              Se connecter
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <ScrollArea className="flex-1 z-10">
          <div className="max-w-4xl mx-auto px-6 py-12 lg:px-8 pb-32">
            
            {/* Breadcrumb & Title */}
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-2 text-sm text-primary font-medium tracking-widest mb-4 uppercase">
                <ScrollText className="w-4 h-4" />
                <span>Règlements</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ministère</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground text-glow tracking-tight">
                Règlement spécifique au RP
              </h1>
            </div>

            {/* Intro Callout */}
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                <span className="text-foreground font-semibold text-primary">Ce règlement est considéré comme lu et approuvé par toutes et tous.</span> Des sanctions peuvent donc vous être appliquées si celui-ci est enfreint. Le règlement de faction doit être connu et appris par tous les joueurs souhaitant s'immiscer dans un RP dit 'plus sérieux'. Aucune dérogation aux règles ne sera tolérée, de plus chaque erreur commise sera sanctionnée d'un avertissement 'Faction'. Un avertissement 'Faction' équivaut à une probable rétrogradation directe du poste en question suivie d'une exclusion de la faction pour une durée de 2 mois. Avant tout, il est interdit de faire son propre règlement, si une précision n'est pas inscrite sur ce règlement elle est automatiquement interdite jusqu'à discussion de celle-ci en réunion STAFF.
              </p>
            </div>

            {/* Accordions */}
            <Accordion type="single" collapsible className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              
              <AccordionItem value="item-1" className="border border-border bg-card rounded-lg overflow-hidden data-[state=open]:border-primary/50 transition-colors">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/50 transition-colors group">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <span className="font-serif font-bold text-lg">1</span>
                    </div>
                    <span className="font-serif text-xl font-semibold tracking-wide">Fiche de suivie</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="text-muted-foreground leading-relaxed space-y-4">
                    <p>Un système suivie a été mis en place est obligatoire pour tout membre de faction, il s'agit tout simplement de votre fiche personnelle ou seront inscrit : vos informations RP, vos interactions RP, votre histoire, vos dons et toutes informations complémentaires.</p>
                    <p>Ce système est mit en place pour seconder le système de CK qui prend désormais la place du système de capture, pour résumer, vous devrez noter sous forme de résumé très court les interactions que vous aurez avec un autre personnage, qu'elles soient positive comme négative.</p>
                    <p>Ainsi pour vos demandes futurs nous aurons une potentielle trace de vos agissements et donc une meilleures gestion et rapidité de traitement !</p>
                    <p className="text-primary/80 font-medium italic">Nous vous invitons à le prendre au premier degrés, car toutes informations que vous oublierez ne pourront être comptées !</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border border-border bg-card rounded-lg overflow-hidden data-[state=open]:border-primary/50 transition-colors">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/50 transition-colors group">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <span className="font-serif font-bold text-lg">2</span>
                    </div>
                    <span className="font-serif text-xl font-semibold tracking-wide">Le FearRP</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="text-muted-foreground leading-relaxed space-y-4">
                    <p>Le FearRP est "le jeu de la peur". Lorsque l'occasion se présente, vous devez absolument avoir peur. Rappelez-vous que vous incarnez un personnage et qu'il n'a qu'une seule vie ! Si sa vie est en danger, vous devez obligatoirement respecter la peur de mourir.</p>
                    <div className="bg-secondary/30 p-4 rounded border-l-2 border-border">
                      <span className="text-foreground font-semibold">Exemple :</span> Vous ne pouvez pas fuir lorsqu'un Mangemort vous pointe avec sa baguette magique puisqu'il a juste à prononcer l'incantation pour vous tuer, si vous avez le malheur de bouger. Vous n'êtes pas immortel comme l'a été Nicolas Flamel !
                    </div>
                    <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-md">
                      <p className="text-red-400"><strong className="text-red-500">ATTENTION :</strong> Le FearRP ne comprend pas uniquement la "peur de mourir" mais également la peur d'une sanction. Il s'applique donc également aux interactions avec les Préfets, Professeurs, Aurors, Membres du ministère, Directeur, etc. Attention à bien faire des choix logiques et respectant le RolePlay. Désormais, en cas de NoFear face à des personnes de faction, si celles-ci jugent que votre Fear n'est pas assez présent et que vous faites preuve de NoFear, cela pourra mener à un CK direct de votre personnage sur scène, suite à un support afin d'apporter les différents points de vue.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border border-border bg-card rounded-lg overflow-hidden data-[state=open]:border-primary/50 transition-colors">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/50 transition-colors group">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <span className="font-serif font-bold text-lg">3</span>
                    </div>
                    <span className="font-serif text-xl font-semibold tracking-wide">Le PainRP</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="text-muted-foreground leading-relaxed space-y-4">
                    <p>Le PainRP est le "jeu de la douleur" dans le RolePlay. Comme son nom l'indique, vous devez respecter le jeu de la douleur en la simulant lorsque la situation se présente. Vous ne pouvez pas, par exemple, faire comme si de rien n'était alors que vous avez reçu un Endoloris (Le Sortilège Doloris est l'un des trois Sortilèges Impardonnables). Il y a des conséquences mentales et physiques derrière.</p>
                    <p>Désormais, pour que les choses soient plus claires dans l'esprit de tout le monde, un Auror, Mangemort, Professeur, membre du Ministère, Mage indépendant, Vampire ou Élève passant sous le seuil des 30 HP ou l'égalant, ne pourra plus faire usage de sortilèges, ne pourra plus courir et devra simplement trotter ACCROUPI en espérant recevoir de l'aide de ses alliés, se cacher afin de semer les opposants ou bien se rendre.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border border-border bg-card rounded-lg overflow-hidden data-[state=open]:border-primary/50 transition-colors">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/50 transition-colors group">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <span className="font-serif font-bold text-lg">4</span>
                    </div>
                    <span className="font-serif text-xl font-semibold tracking-wide">NLR (New Life Rule)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="text-muted-foreground leading-relaxed space-y-4">
                    <p>La New Life Rule (NLR) entre en vigueur après la mort ou un coma IC. Lorsqu'un personnage est vaincu en combat, il ne meurt pas réellement ; il est transporté, de manière passive, à l'infirmerie ou à l'hôpital pour recevoir des soins. Il est strictement interdit de revenir sur les lieux de votre mort pour chercher vengeance.</p>
                    <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-md">
                      <p className="text-red-400"><strong className="text-red-500">ATTENTION :</strong> Il est interdit de revenir sur la scène ayant provoqué votre mort, interdiction donc d'y revenir tant qu'elle n'est pas finie, généralement un "/advert" ou un message dans le chat pour vous avertir de la fin de celle-ci.</p>
                    </div>
                    <div className="bg-secondary/30 p-4 rounded border-l-2 border-border">
                      <span className="text-foreground font-semibold">Exemple :</span> Vous êtes impliqué dans un combat contre un Mangemort et vous êtes vaincu. Conformément à la NLR, vous ne devez pas retourner sur le champ de bataille pour vous venger. Au lieu de cela, vous devez jouer une scène de RP où votre personnage se réveille à l'infirmerie, reçoit des soins et se remet progressivement de ses blessures.
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border border-border bg-card rounded-lg overflow-hidden data-[state=open]:border-primary/50 transition-colors">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/50 transition-colors group">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <span className="font-serif font-bold text-lg">5</span>
                    </div>
                    <span className="font-serif text-xl font-semibold tracking-wide">Le FairPlay</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="text-muted-foreground leading-relaxed space-y-4">
                    <p>Assurez vous que les scènes soient menés avec respect et bienséance. Favorisez des interactions qui enrichissent l'expérience de jeu pour toutes les factions, en mettant l'accent sur des scénarios créatifs et intéressants pour tout le monde.</p>
                    <div className="bg-secondary/30 p-4 rounded border-l-2 border-border">
                      <span className="text-foreground font-semibold">Exemple :</span> Vous êtes en négociation et vous êtes en surnombre comparé a vos opposants face à vous, vous devez laisser des portes de sortie a la factions en minorité.
                    </div>
                    <p className="text-primary/80 italic font-medium">Attention, cela n'interdit pas que vous pouvez mener un combat si la scène tourne au "vinaigre".</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border border-border bg-card rounded-lg overflow-hidden data-[state=open]:border-primary/50 transition-colors">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/50 transition-colors group">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <span className="font-serif font-bold text-lg">6</span>
                    </div>
                    <span className="font-serif text-xl font-semibold tracking-wide">Les Temps de RP</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="text-muted-foreground leading-relaxed space-y-4">
                    <p>Afin de garder une exclusivité aux scènes, une gestion plus accrue avec d'avantage d'observation sur vos agissements et donc un meilleur Gameplay pour vous, nous avons, la gérance, votés pour instaurer un couvre feu a fenêtre très large. Le couvre feu a pour But de minimiser les scènes RP faites à l'arrache sans réel but derrière et donc favoriser les heures de pointes avec d'avantages de mondes et de propositions.</p>
                    <ul className="list-disc list-inside pl-4 space-y-2 text-foreground/80">
                      <li><strong className="text-foreground">En semaine (Lundi-Jeudi) :</strong> de 17h à 1h du matin</li>
                      <li><strong className="text-foreground">En Week-end (Vendredi-Dimanche) :</strong> 16h a 2h du matin</li>
                    </ul>
                    <p className="pt-2">Pendant la tranche horaire de couvre feu (1h01/2h01 à 11h59) il est interdit de jouer <strong className="text-primary">QUELCONQUE INTERACTIONS</strong> en membre de faction, que ce soit d'une simple capture d'un élève à une entrevue entre différentes factions. Il est autorisé néanmoins de faire des scènes entre membre d'une même faction, qui ne crée aucun conflit extérieur, style entraînement/cours...</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border border-border bg-card rounded-lg overflow-hidden data-[state=open]:border-primary/50 transition-colors">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/50 transition-colors group">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <span className="font-serif font-bold text-lg">7</span>
                    </div>
                    <span className="font-serif text-xl font-semibold tracking-wide">Les Sanctions</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="text-muted-foreground leading-relaxed space-y-6">
                    <p>Au sein d'une faction, plusieurs types de sanctions peuvent être appliqués selon la nature de la faute (RP ou HRP). Voici un récapitulatif :</p>

                    <div className="space-y-2">
                      <h4 className="text-lg font-serif font-semibold text-foreground border-b border-border pb-1">Sanctions RP</h4>
                      <ul className="list-disc list-inside pl-2 space-y-1">
                        <li>Ces sanctions sont décidées par un supérieur hiérarchique RP.</li>
                        <li>Elles ont une portée uniquement roleplay et doivent être jouées en conséquence.</li>
                        <li>Elles peuvent également être levées par un supérieur RP.</li>
                      </ul>
                      <div className="bg-secondary/30 p-3 mt-2 rounded border-l-2 border-border text-sm">
                        <span className="text-foreground font-semibold">Exemple :</span> "Tu es sanctionné pour ton comportement, tu dois nettoyer l'ensemble du Ministère."
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-lg font-serif font-semibold text-foreground border-b border-border pb-1">Sanctions HRP</h4>
                      <p>Ces sanctions sont plus graves car elles concernent le comportement hors roleplay. Elles sont infligées par votre gérant de faction et fonctionnent par palier :</p>
                      <ul className="list-disc list-inside pl-2 space-y-1">
                        <li><strong className="text-foreground">1 / 2 / 3 :</strong> Chaque croix représente un avertissement officiel.</li>
                        <li>À la 3e croix, vous perdez automatiquement votre rôle dans la faction.</li>
                      </ul>
                    </div>

                    <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-md space-y-2">
                      <h4 className="text-lg font-serif font-semibold text-red-500">Le Drapeau Rouge</h4>
                      <ul className="list-disc list-inside pl-2 space-y-1 text-red-200/80">
                        <li>Sanction exceptionnelle décidée par un conseil regroupant votre gérant de faction et un Super Admin.</li>
                        <li>Cela signifie que si vous êtes capturé, votre vie est en jeu.</li>
                        <li>Le gérant de la faction vous ayant capturé pourra demander un CK immédiat, sans avoir à faire de requête.</li>
                      </ul>
                    </div>

                    <div className="bg-red-950/40 border border-red-600/50 p-4 rounded-md space-y-2">
                      <h4 className="text-lg font-serif font-bold text-red-500 text-glow">Le Drapeau Noir</h4>
                      <ul className="list-disc list-inside pl-2 space-y-1 text-red-200">
                        <li>Sanction extrême, infligée uniquement par un Super Admin.</li>
                        <li>Elle signifie que votre vie est systématiquement en danger lors de tout combat RP.</li>
                        <li>Si vous tombez au combat, vous serez automatiquement CK, sans discussion.</li>
                        <li>Si vous tentez d'ésquivez cette sanction par un moyen visible, vous serez automatiquement CK.</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-lg font-serif font-semibold text-foreground border-b border-border pb-1">Sanction Staff</h4>
                      <ul className="list-disc list-inside pl-2 space-y-1">
                        <li>Le staff peut vous sanctionner en cas d'infraction au règlement du serveur, même en dehors du cadre RP.</li>
                        <li>En cas de sanction, votre gérant de faction sera immédiatement prévenu.</li>
                        <li>L'Administration (Admin, Super Admin…) se réserve le droit d'appliquer des sanctions sévères si une faute dépasse les compétences du staff ou de votre gérant.</li>
                        <li>Ces décisions sont souveraines et peuvent entraîner des bannissements ou exclusions définitives de votre faction ou du serveur.</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="border border-border bg-card rounded-lg overflow-hidden data-[state=open]:border-primary/50 transition-colors">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/50 transition-colors group">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <span className="font-serif font-bold text-lg">8</span>
                    </div>
                    <span className="font-serif text-xl font-semibold tracking-wide">Les élèves</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                  <div className="text-muted-foreground leading-relaxed space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-lg font-serif font-semibold text-foreground">Capture en Forêt</h4>
                      <p>Les factions Vampire et Mangemort sont autorisées à capturer des élèves en Forêt, uniquement dans un cadre RP justifié.</p>
                      <p>Une capture est autorisée si au moins l'une des conditions suivantes est remplie :</p>
                      <ul className="list-disc list-inside pl-2 space-y-1">
                        <li>L'élève adopte un comportement agressif, provocateur ou un NoFear manifeste ;</li>
                        <li>L'élève interfère volontairement avec une action RP de la faction ;</li>
                        <li>La faction est explicitement à la recherche d'un élève précis dans le cadre d'une mission, d'un ordre hiérarchique ou d'un Ordre de Capture.</li>
                      </ul>
                      <p className="pt-2">En revanche, il est strictement interdit de capturer un élève :</p>
                      <ul className="list-disc list-inside pl-2 space-y-1">
                        <li>se promenant calmement en forêt ;</li>
                        <li>chassant ou prenant l'air sans comportement agressif ;</li>
                        <li>respectant le Fear RP et n'interagissant pas avec la faction.</li>
                      </ul>
                      <p className="text-primary/80 font-medium italic pt-2">Toute capture sans justification RP valable sera considérée comme un abus / WinRP et pourra être sanctionnée.</p>
                    </div>

                    <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-md space-y-2">
                      <h4 className="text-lg font-serif font-semibold text-red-500">Capture au Terrain de Quidditch</h4>
                      <p className="text-red-300">Les captures d'élèves au Terrain de Quidditch sont strictement interdites, sans exception.</p>
                      <p className="text-red-300">De plus :</p>
                      <ul className="list-disc list-inside pl-2 space-y-1 text-red-300/80">
                        <li>L'accès au Terrain de Quidditch est interdit à toute personne en dessous du grade de Membre du Conseil/Commandant Auror/Emissaire du Sang ;</li>
                        <li>Toute présence non autorisée ou tentative de capture dans cette zone sera sanctionnée.</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
