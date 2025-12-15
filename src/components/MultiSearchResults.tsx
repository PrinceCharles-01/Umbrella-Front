import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Pill,
  Star,
  ShoppingCart,
  Eye
} from "lucide-react";
import PharmacyDetailsModal from "./PharmacyDetailsModal";
import { ApiMedication, ApiPharmacy, ApiPharmacyMedication } from "@/lib/api"; // Import ApiMedication and ApiPharmacy

interface Pharmacy extends ApiPharmacy {
  distance: string;
  openHours: string;
  isOpen: boolean;
  medicationsAvailable: number; // This is from the single search context, might need adjustment
  insurances: string[];
  rating: number;
  specialInsurance: string | null;
  medicationPrice?: number | null;
  medicationsFound?: number; // From API for multi-search
  totalMedicationsSearched?: number; // From API for multi-search
  medications?: ApiPharmacyMedication[]; // Add this line
}

import { CartItem } from "../../types";

interface MultiSearchResultsProps {
  searchedMedications: ApiMedication[];
  pharmacies: Pharmacy[];
  onBack: () => void;
  prescriptionItems: CartItem[];
  setPrescriptionItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const MultiSearchResults = ({ searchedMedications, pharmacies, onBack, prescriptionItems, setPrescriptionItems }: MultiSearchResultsProps) => {
  const [currentPharmacyIndex, setCurrentPharmacyIndex] = useState(0);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);

  // Trier les pharmacies par nombre de médicaments disponibles
  const sortedPharmacies = [...pharmacies].sort((a, b) => 
    (b.medications?.length ?? 0) - (a.medications?.length ?? 0)
  );

  // Handle case where no pharmacies are found
  if (sortedPharmacies.length === 0) {
    return (
      <div className="glass-card p-12 rounded-xl text-center border border-dashed border-border/50">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full glass-accent-blue flex items-center justify-center shadow-lg">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">Aucune pharmacie trouvée</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Aucune pharmacie ne correspond à votre recherche de médicaments. Essayez de modifier votre sélection.
        </p>
        <Button 
          variant="outline" 
          onClick={onBack}
          className="apple-press mt-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la recherche
        </Button>
      </div>
    );
  }

  const currentPharmacy = sortedPharmacies[currentPharmacyIndex];
  
  const nextPharmacy = () => {
    setCurrentPharmacyIndex((prev) => (prev + 1) % sortedPharmacies.length);
  };

  const prevPharmacy = () => {
    setCurrentPharmacyIndex((prev) => (prev - 1 + sortedPharmacies.length) % sortedPharmacies.length);
  };

  const handleAddAllToCart = () => {
    if (!currentPharmacy || !currentPharmacy.medications) return;

    const newCartItems: CartItem[] = currentPharmacy.medications.map(med => ({
      medicationId: med.id,
      medicationName: med.nom,
      quantity: 1,
      price: med.prix.toString(),
      pharmacyId: currentPharmacy.id,
      pharmacyName: currentPharmacy.nom,
      pharmacyAddress: currentPharmacy.adresse,
    }));

    setPrescriptionItems(prevItems => {
      const existingMedicationIds = new Set(prevItems.map(item => item.medicationId));
      const filteredNewItems = newCartItems.filter(item => !existingMedicationIds.has(item.medicationId));
      return [...prevItems, ...filteredNewItems];
    });
  };

  const getAvailabilityStatus = (pharmacy: Pharmacy) => {
    const actualAvailableCount = pharmacy.medications?.length ?? 0;
    const totalSearched = searchedMedications.length;
    
    if (actualAvailableCount === totalSearched) return { status: "complete", text: "Tous disponibles", icon: CheckCircle2, color: "text-green-600" };
    if (actualAvailableCount > totalSearched / 2) return { status: "partial", text: "Partiellement disponible", icon: AlertCircle, color: "text-orange-500" };
    return { status: "limited", text: "Peu disponible", icon: XCircle, color: "text-red-500" };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-orange-500"; 
    return "bg-red-500";
  };

  const calculateScore = (pharmacy: Pharmacy) => {
    const actualAvailableCount = pharmacy.medications?.length ?? 0;
    const totalSearched = searchedMedications.length;
    if (totalSearched === 0) return 0; // Avoid division by zero
    return Math.round((actualAvailableCount / totalSearched) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header avec résumé */}
      <div className="glass-card p-6 rounded-xl border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="apple-press hover:bg-accent/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Nouvelle recherche
          </Button>
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
            {searchedMedications.length} médicament{searchedMedications.length > 1 ? 's' : ''} recherché{searchedMedications.length > 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Résultats de recherche multiple</h2>
            <p className="text-muted-foreground">
              Voici les pharmacies classées par disponibilité de vos médicaments. 
              Utilisez les flèches pour naviguer entre les pharmacies.
            </p>
          </div>
          
          <div className="glass-accent-blue p-4 rounded-xl">
            <h3 className="font-semibold text-foreground mb-3">Médicaments recherchés :</h3>
            <div className="flex flex-wrap gap-2">
              {searchedMedications.map((med) => (
                <Badge key={med.id} variant="secondary" className="text-xs">
                  {med.nom}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation et pharmacie actuelle */}
      <div className="flex items-center gap-4 justify-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={prevPharmacy}
          disabled={sortedPharmacies.length <= 1}
          className="apple-press"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Pharmacie</span>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {currentPharmacyIndex + 1} / {sortedPharmacies.length}
          </Badge>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={nextPharmacy}
          disabled={sortedPharmacies.length <= 1}
          className="apple-press"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Détails de la pharmacie actuelle */}
      <Card className="glass-card border border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-xl text-foreground">{currentPharmacy.nom}</CardTitle>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-foreground">{currentPharmacy.note}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-secondary" />
                  {currentPharmacy.adresse} • {currentPharmacy.distance}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-secondary" />
                  {currentPharmacy.telephone}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-secondary" />
                  {currentPharmacy.openHours}
                </div>
              </div>
            </div>
            
            <div className="text-right space-y-3">
              <div className="flex items-center gap-2">
                <div 
                  className={`w-3 h-3 rounded-full ${getScoreColor(calculateScore(currentPharmacy))}`}
                />
                <span className="text-2xl font-bold text-foreground">
                  {calculateScore(currentPharmacy)}%
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedPharmacy(currentPharmacy)}
                  className="apple-press"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Infos
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status de disponibilité */}
          <div className="flex items-center gap-3 p-4 glass-accent-green rounded-xl">
            {(() => {
              const { status, text, icon: Icon, color } = getAvailabilityStatus(currentPharmacy);
              return (
                <>
                  <Icon className={`h-5 w-5 ${color}`} />
                  <div>
                    <div className="font-semibold text-foreground">{text}</div>
                    <div className="text-sm text-muted-foreground">
                      {currentPharmacy.medications?.length ?? 0} sur {searchedMedications.length} médicaments
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          <Separator />

          {/* Liste détaillée des médicaments */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Pill className="h-5 w-5 text-secondary" />
              Détail des médicaments
            </h4>
            
            <div className="grid gap-3">
              {searchedMedications.map((med) => {
                const pharmMed = currentPharmacy.medications?.find(pm => pm.medication === med.id);
                const isAvailable = !!pharmMed;

                return (
                  <div 
                    key={med.id}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      isAvailable 
                        ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50' 
                        : 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isAvailable ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-foreground">{med.nom}</h5>
                          <Badge variant="outline" className="text-xs">
                            {med.categorie}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{med.description}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          Dosage: {med.dosage}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {isAvailable && pharmMed ? (
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-green-700 dark:text-green-400">
                              Disponible
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {pharmMed.stock} unités
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-red-600 dark:text-red-400">
                            Non disponible
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          {currentPharmacy.medications && currentPharmacy.medications.length > 0 && (
            <div className="pt-4 border-t border-border/20">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {currentPharmacy.medications.length} médicament{currentPharmacy.medications.length !== 1 ? 's' : ''} disponible{currentPharmacy.medications.length !== 1 ? 's' : ''}
                </div>
                <Button 
                  className="apple-press bg-secondary hover:bg-secondary/90"
                  onClick={handleAddAllToCart}
                  disabled={currentPharmacy.medications.length === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ajouter à l'ordonnance
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal détails pharmacie */}
      <PharmacyDetailsModal 
        pharmacy={selectedPharmacy}
        isOpen={!!selectedPharmacy}
        onClose={() => setSelectedPharmacy(null)}
      />
    </div>
  );
};

export default MultiSearchResults;