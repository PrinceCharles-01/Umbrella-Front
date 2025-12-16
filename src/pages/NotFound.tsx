import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header simplifié */}
      <header className="header-modern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 w-fit">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">PharmFinder</span>
          </Link>
        </div>
      </header>

      {/* Main Content - Centré */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="text-center max-w-2xl">
          {/* Icon 404 avec animation */}
          <div className="mb-8 sm:mb-12 inline-block">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl flex items-center justify-center mx-auto pulse-gentle">
                <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-pink-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center rotate-12">
                <span className="text-2xl sm:text-3xl font-bold text-emerald-600">?</span>
              </div>
            </div>
          </div>

          {/* Titre 404 */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-foreground mb-4 sm:mb-6" style={{ letterSpacing: '-0.02em' }}>
            404
          </h1>

          {/* Message d'erreur */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Page introuvable
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-12 max-w-md mx-auto px-4">
            Oups ! La page que vous cherchez n'existe pas ou a été déplacée.
          </p>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link to="/">
              <Button size="lg" className="btn-primary w-full sm:w-auto scale-hover">
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
            <Link to="/scan">
              <Button size="lg" variant="outline" className="w-full sm:w-auto scale-hover">
                <Search className="w-4 h-4 mr-2" />
                Scanner une ordonnance
              </Button>
            </Link>
          </div>

          {/* Chemin erroné (pour debug) */}
          <div className="mt-12 sm:mt-16">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Chemin recherché : <code className="px-2 py-1 bg-muted rounded text-foreground font-mono text-xs">{location.pathname}</code>
            </p>
          </div>
        </div>
      </main>

      {/* Footer simplifié */}
      <footer className="border-t border-border/50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PharmFinder. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
