import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pill, Loader2 } from "lucide-react";
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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Résultats de la recherche
                </h2>
                <p className="text-muted-foreground">
                  Basé sur les médicaments de votre ordonnance.
                </p>
              </div>
              <Button variant="outline" onClick={handleBackToScan}>
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
        <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Vérification des médicaments
              </h2>
              <p className="text-muted-foreground">
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
        <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Scanner votre ordonnance
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Prenez une photo de votre ordonnance médicale et nous détecterons
                automatiquement les médicaments prescrits.
              </p>
            </div>

            <PrescriptionScan onMedicationsDetected={handleMedicationsDetected} />

            <div className="glass-card p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-4">💡 Conseils pour un bon scan</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Assurez-vous que l'ordonnance est bien éclairée
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Prenez la photo de face, sans angle
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  L'écriture doit être lisible et nette
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Évitez les reflets et les ombres
                </li>
              </ul>
            </div>
          </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary">
              <Pill className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">PharmFinder</h1>
              <p className="text-sm text-muted-foreground">Scanner d'ordonnances</p>
            </div>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {renderContent()}
      </main>

      <footer className="bg-background border-t border-border/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PharmFinder. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default ScanPrescription;
