import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pill, FileText, Shield, Scale } from 'lucide-react';

const LegalMentions = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ============================================
          🎨 HEADER MODERNE & RESPONSIVE
          ============================================ */}
      <header className="header-modern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">PharmFinder</span>
          </Link>

          {/* Bouton retour */}
          <Link to="/">
            <Button variant="outline" size="sm" className="scale-hover">
              <ArrowLeft className="h-3 h-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Retour</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* ============================================
          ✨ MAIN CONTENT - RESPONSIVE
          ============================================ */}
      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header avec badge */}
          <div className="mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-6">
              <Scale className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
              <span className="text-xs sm:text-sm font-medium text-emerald-700">Documents légaux</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4" style={{ letterSpacing: '-0.02em' }}>
              Mentions Légales
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Informations légales et conditions d'utilisation de PharmFinder
            </p>
          </div>

          {/* Sections avec cards modernes */}
          <div className="space-y-6 sm:space-y-8">
            {/* Section 1 */}
            <div className="card-modern bg-white">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">1. Informations Générales</h2>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground pl-0 sm:pl-16">
                <p><span className="font-medium text-foreground">Nom de l'entreprise :</span> Umbrella PharmFinder</p>
                <p><span className="font-medium text-foreground">Forme juridique :</span> [À compléter]</p>
                <p><span className="font-medium text-foreground">Adresse du siège social :</span> Libreville, Gabon</p>
                <p><span className="font-medium text-foreground">Numéro de téléphone :</span> [À compléter]</p>
                <p><span className="font-medium text-foreground">Adresse e-mail :</span> contact@pharmfinder.ga</p>
                <p><span className="font-medium text-foreground">Numéro d'immatriculation :</span> [À compléter]</p>
                <p><span className="font-medium text-foreground">Capital social :</span> [À compléter]</p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="card-modern bg-white">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">2. Hébergement</h2>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground pl-0 sm:pl-16">
                <p><span className="font-medium text-foreground">Hébergeur Frontend :</span> Vercel Inc.</p>
                <p><span className="font-medium text-foreground">Hébergeur Backend :</span> Railway Corp.</p>
                <p><span className="font-medium text-foreground">Hébergeur Base de données :</span> PostgreSQL sur Railway</p>
              </div>
            </div>

            {/* Section 3 */}
            <div className="card-modern bg-white">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">3. Propriété Intellectuelle</h2>
                </div>
              </div>
              <div className="text-sm sm:text-base text-muted-foreground pl-0 sm:pl-16 leading-relaxed">
                <p>L'ensemble de ce site relève de la législation gabonaise, française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques. La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.</p>
              </div>
            </div>

            {/* Section 4 */}
            <div className="card-modern bg-white">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">4. Données Personnelles</h2>
                </div>
              </div>
              <div className="text-sm sm:text-base text-muted-foreground pl-0 sm:pl-16 leading-relaxed">
                <p>Umbrella PharmFinder s'engage à ce que la collecte et le traitement de vos données, effectués à partir du site, soient conformes au règlement général sur la protection des données (RGPD) et à la loi Informatique et Libertés. Pour toute information ou exercice de vos droits Informatique et Libertés sur les traitements de données personnelles gérés par Umbrella PharmFinder, vous pouvez nous contacter à l'adresse : contact@pharmfinder.ga</p>
              </div>
            </div>

            {/* Section 5 */}
            <div className="card-modern bg-white">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">5. Limitation de Responsabilité</h2>
                </div>
              </div>
              <div className="text-sm sm:text-base text-muted-foreground pl-0 sm:pl-16 leading-relaxed">
                <p>Umbrella PharmFinder ne saurait être tenu pour responsable des erreurs rencontrées sur le site, problèmes techniques, interprétation des informations publiées et conséquences de leur utilisation. En conséquence, l'utilisateur reconnaît utiliser ces informations sous sa responsabilité exclusive. Les informations sur les médicaments sont fournies à titre indicatif et ne remplacent pas l'avis d'un professionnel de santé.</p>
              </div>
            </div>

            {/* Section 6 */}
            <div className="card-modern bg-white">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">6. Droit Applicable</h2>
                </div>
              </div>
              <div className="text-sm sm:text-base text-muted-foreground pl-0 sm:pl-16 leading-relaxed">
                <p>Les présentes mentions légales sont régies par le droit gabonais. En cas de litige, les tribunaux gabonais seront seuls compétents.</p>
              </div>
            </div>
          </div>

          {/* Date de mise à jour */}
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-muted/50 rounded-xl">
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </main>

      {/* ============================================
          📄 FOOTER MODERNE & RESPONSIVE
          ============================================ */}
      <footer className="border-t border-border/50 mt-auto bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-muted-foreground text-xs sm:text-sm">
          <p>&copy; {new Date().getFullYear()} PharmFinder. Tous droits réservés.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-4">
            <Link to="/mentions-legales" className="hover:text-foreground transition-colors font-medium">Mentions Légales</Link>
            <Link to="/register-pharmacy" className="hover:text-foreground transition-colors">Référencer ma pharmacie</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LegalMentions;
