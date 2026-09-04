/** Piyasa Odası: Uygulama genelinde koyu terminal teması zorunludur. */
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { SiteBanner } from "./components/SiteBanner";
import { ContentProvider, useContent } from "./content/ContentContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./i18n";
import { refreshScrollTriggers } from "./lib/gsap";
import Admin from "./pages/Admin";
import Home from "./pages/Home";

function Router() {
  const [location] = useLocation();

  // Refresh ScrollTrigger positions whenever route changes
  useEffect(() => {
    refreshScrollTriggers();
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * İçerik katmanı sözlüğün üzerine yazdığı için dil sağlayıcısı, metin
 * değişikliklerinin sürümünü bilmek zorunda; aksi halde `t` önbellekte kalır.
 */
function LocalizedApp() {
  const { overridesRevision } = useContent();

  return (
    <LanguageProvider overridesRevision={overridesRevision}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <SiteBanner />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ContentProvider>
        <LocalizedApp />
      </ContentProvider>
    </ErrorBoundary>
  );
}

export default App;
