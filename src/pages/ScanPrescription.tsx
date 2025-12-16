import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pill, Loader2, Camera, CheckCircle2, Sparkles } from "lucide-react";
import PrescriptionScan from "@/components/PrescriptionScan";
import MedicationVerification from "@/components/MedicationVerification";
import MultiSearchResults from "@/components/MultiSearchResults";
import { findPharmaciesByMedications } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DetectedMedication {
  id?: number;
  nom: string;
  dosage: string;
  dosage_detected?: string;
  frequency?: string;
  categorie?: string;
  confidence?: number;
  matched_text?: string;
  isManuallyAdded?: boolean;
  isEdited?: boolean;
}

// Interface pour la réponse de l'API des pharmacies
interface Pharmacy {
  // Ajoutez ici les champs attendus pour une pharmacie
  id: number;
  nom: string;
  // ... autres champs
}

const ScanPrescription = () => {
  const [detectedMedications, setDetectedMedications] = useState<DetectedMedication[]>([]);
  const [ocrText, setOcrText] = useState<string>("");
  const [showVerification, setShowVerification] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [foundPharmacies, setFoundPharmacies] = useState<Pharmacy[]>([]);
  const [isSearchingPharmacies, setIsSearchingPharmacies] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);

  const navigate = useNavigate();

  const handleMedicationsDetected = (medicationIds: number[], medications: DetectedMedication[], text: string) => {
    setDetectedMedications(medications);
    setOcrText(text);
    setShowVerification(true);
    // On réinitialise les anciens résultats
    setShowResults(false);
    setFoundPharmacies([]);
    setSearchError(null);
  };

  const handleVerificationConfirm = async (verifiedMedications: DetectedMedication[]) => {
    setDetectedMedications(verifiedMedications);
    setIsSearchingPharmacies(true);
    setSearchError(null);

    // Extraire les IDs valides pour la recherche
    const medicationIds = verifiedMedications
      .map(med => med.id)
      .filter((id): id is number => id !== undefined);

    if (medicationIds.length > 0) {
      try {
        const pharmacies = await findPharmaciesByMedications(medicationIds);
        setFoundPharmacies(pharmacies);
      } catch (error) {
        console.error("Erreur lors de la recherche de pharmacies:", error);
        setSearchError("Impossible de trouver les pharmacies pour ces médicaments. Veuillez réessayer.");
      }
    } else {
        // S'il n'y a aucun médicament avec un ID (ex: tous ajoutés manuellement sans correspondance DB),
        // on ne peut pas chercher de pharmacies.
        setFoundPharmacies([]);
    }

    setIsSearchingPharmacies(false);
    setShowVerification(false);
    setShowResults(true);
  };

  const handleVerificationCancel = () => {
    setShowVerification(false);
    setDetectedMedications([]);
    setOcrText("");
  };

  const handleBackToScan = () => {
    setShowResults(false);
    setShowVerification(false);
    setDetectedMedications([]);
    setOcrText("");
    setFoundPharmacies([]);
    setSearchError(null);
  };

  const renderContent = () => {
    if (showResults) {
      return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Résultats de la recherche
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Basé sur les médicaments de votre ordonnance.
                </p>
              </div>
              <Button variant="outline" onClick={handleBackToScan} className="scale-hover w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Nouveau scan
              </Button>
            </div>

            {searchError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{searchError}</AlertDescription>
              </Alert>
            )}

            <MultiSearchResults
              searchedMedications={detectedMedications.map(med => ({
                id: med.id,
                nom: med.nom,
                description: med.categorie || '',
                dosage: med.dosage,
                categorie: med.categorie || '',
                prix: 0,
                min_stock: 0
              }))}
              pharmacies={foundPharmacies}
              isLoading={isSearchingPharmacies}
              onBack={handleBackToScan}
              prescriptionItems={prescriptionItems}
              setPrescriptionItems={setPrescriptionItems}
            />
          </div>
      );
    }

    if (showVerification) {
      return (
        <div className="space-y-6 sm:space-y-8">
            <div className="text-center space-y-3 sm:space-y-4 px-4">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-4">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm font-medium text-emerald-700">Scan réussi</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                Vérification des médicaments
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                Vérifiez et modifiez les informations détectées avant de continuer
              </p>
            </div>

            <MedicationVerification
              medications={detectedMedications}
              ocrText={ocrText}
              onConfirm={handleVerificationConfirm}
              onCancel={handleVerificationCancel}
            />
          </div>
      );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="text-center space-y-3 sm:space-y-4 px-4">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-4">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm font-medium text-emerald-700">Scan intelligent avec IA</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                Scanner votre ordonnance
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Prenez une photo de votre ordonnance médicale et nous détecterons
                automatiquement les médicaments prescrits.
              </p>
            </div>

            <PrescriptionScan onMedicationsDetected={handleMedicationsDetected} />

            <div className="glass-card p-6 sm:p-8 rounded-2xl">
              <h3 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6 flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </div>
                Conseils pour un bon scan
              </h3>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Assurez-vous que l'ordonnance est bien éclairée</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Prenez la photo de face, sans angle</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>L'écriture doit être lisible et nette</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Évitez les reflets et les ombres</span>
                </li>
              </ul>
            </div>
          </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ============================================
          🎨 HEADER MODERNE & RESPONSIVE
          ============================================ */}
      <header className="header-modern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo avec badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-foreground">PharmFinder</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Scanner d'ordonnances</p>
            </div>
          </div>

          {/* Bouton retour responsive */}
          <Link to="/">
            <Button variant="outline" size="sm" className="scale-hover">
              <ArrowLeft className="h-3 h-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Retour</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* ============================================
          ✨ MAIN CONTENT RESPONSIVE
          ============================================ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {renderContent()}
      </main>

      {/* ============================================
          📄 FOOTER MODERNE & RESPONSIVE
          ============================================ */}
      <footer className="border-t border-border/50 mt-12 sm:mt-16 md:mt-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-muted-foreground text-xs sm:text-sm">
          <p>&copy; {new Date().getFullYear()} PharmFinder. Tous droits réservés.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-4">
            <Link to="/mentions-legales" className="hover:text-foreground transition-colors">Mentions Légales</Link>
            <Link to="/register-pharmacy" className="hover:text-foreground transition-colors">Référencer ma pharmacie</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ScanPrescription;
