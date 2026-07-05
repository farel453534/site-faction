import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { SearchProvider } from "@/lib/search-context";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Reglement from "@/pages/Reglement";
import RulePageView from "@/pages/RulePageView";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import Gerant from "@/pages/Gerant";
import Tickets from "@/pages/Tickets";
import GroupView from "@/pages/GroupView";
import { useEffect } from "react";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/reglement" component={Reglement} />
      <Route path="/profil" component={Profile} />
      <Route path="/admin" component={Admin} />
      <Route path="/gerant" component={Gerant} />
      <Route path="/tickets" component={Tickets} />
      <Route path="/:group/:page" component={RulePageView} />
      <Route path="/:group" component={GroupView} />
      <Route component={NotFound} />
    </Switch>
  );
}

/** Reads ?login= from the URL on first mount and shows the appropriate toast. */
function LoginErrorNotifier() {
  const { toast } = useToast();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const login = params.get("login");
    if (!login) return;
    // Clean URL without reloading
    const clean = window.location.pathname + window.location.hash;
    window.history.replaceState({}, "", clean);
    if (login === "not_member") {
      toast({
        title: "Accès refusé",
        description: "Tu dois être membre du Discord MSSClick pour te connecter au panel.",
        variant: "destructive",
      });
    } else if (login === "error") {
      toast({
        title: "Erreur de connexion",
        description: "Une erreur est survenue lors de la connexion Discord. Réessaie.",
        variant: "destructive",
      });
    } else if (login === "cancelled") {
      toast({
        title: "Connexion annulée",
        description: "La connexion Discord a été annulée.",
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function App() {
  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SearchProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <LoginErrorNotifier />
            <Layout>
              <Router />
            </Layout>
          </WouterRouter>
        </SearchProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
