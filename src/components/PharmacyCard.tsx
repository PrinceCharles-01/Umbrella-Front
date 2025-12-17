import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Phone, Navigation, Star, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import MedicationCard from "./MedicationCard";
import { ApiMedication, ApiPharmacy } from "@/lib/api";

interface PharmacyCardProps extends ApiPharmacy {
  onViewDetails?: () => void;
  userLocation?: { lat: number; lon: number } | null;
  // For single search context
  confirmedMedication?: ApiMedication | null;
}

const PharmacyCard = ({ 
  onViewDetails,
  userLocation,
  confirmedMedication,
  ...pharmacy
}: PharmacyCardProps) => {

  const handleGetDirections = () => {
    if (pharmacy.latitude && pharmacy.longitude) {
      const origin = userLocation ? `${userLocation.lat},${userLocation.lon}` : '';
      const destination = `${pharmacy.latitude},${pharmacy.longitude}`;
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  const medicationsToDisplay = confirmedMedication && !pharmacy.medications 
    ? [{ ...confirmedMedication, stock_disponible: pharmacy.medication_stock, prix_unitaire: pharmacy.medication_price }]
    : pharmacy.medications || [];

  return (
    <Collapsible className="w-full animate-fade-in">
      <Card className="card-apple p-4 sm:p-6 lift-hover">
        <div className="flex flex-col gap-4">
          {/* Header - Vertical on mobile, horizontal on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-base sm:text-lg mb-2">
                {pharmacy.nom}
              </h3>
              <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="break-words">{pharmacy.adresse}</span>
              </div>
            </div>

            {/* Distance et badge - horizontal sur mobile aussi */}
            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1">
              <div className="text-sm font-medium text-foreground">
                {pharmacy.distance_km ? `${pharmacy.distance_km.toFixed(1)} km` : ""}
              </div>
              <Badge
                variant="outline"
                className={`text-xs whitespace-nowrap ${pharmacy.is_open
                  ? "bg-secondary/10 text-secondary border-secondary/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
                }`}
              >
                {pharmacy.is_open ? "Ouvert" : "Fermé"}
              </Badge>
            </div>
          </div>

          {/* Info section - Vertical on mobile */}
          <div className="flex flex-col gap-3">
            {/* Info items - Stack vertically on mobile */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{pharmacy.opening_time && pharmacy.closing_time ? `${pharmacy.opening_time.slice(0, 5)} - ${pharmacy.closing_time.slice(0, 5)}` : "N/A"}</span>
                </div>
                {pharmacy.telephone && (
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{pharmacy.telephone}</span>
                    </div>
                )}
                {pharmacy.note && parseFloat(pharmacy.note) > 0 && (
                    <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current flex-shrink-0" />
                        <span className="font-medium text-foreground">{parseFloat(pharmacy.note).toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Buttons - Full width on mobile, side by side on desktop */}
            <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button
                variant="ghost"
                size="sm"
                onClick={onViewDetails}
                className="apple-press w-full sm:w-auto text-xs sm:text-sm"
                >
                Détails
                </Button>
                <Button
                variant="outline"
                size="sm"
                onClick={handleGetDirections}
                className="apple-press hover:bg-secondary/10 hover:border-secondary/30 w-full sm:w-auto text-xs sm:text-sm"
                >
                <Navigation className="h-4 w-4 mr-2" />
                Itinéraire
                </Button>
            </div>
          </div>

          {medicationsToDisplay.length > 0 && (
            <CollapsibleTrigger asChild>
                <Button variant="link" className="w-full justify-center items-center gap-2 text-secondary text-xs sm:text-sm">
                    <span className="text-center">Voir les {medicationsToDisplay.length} médicament{medicationsToDisplay.length > 1 ? 's' : ''} disponible{medicationsToDisplay.length > 1 ? 's' : ''}</span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
            </CollapsibleTrigger>
          )}
        </div>
      </Card>

      <CollapsibleContent className="p-4 bg-background/20 rounded-b-xl">
        <div className="space-y-4">
            {medicationsToDisplay.map((med: any) => (
                <MedicationCard 
                    key={med.id}
                    medicationId={med.id}
                    name={med.nom || med.medication?.nom}
                    description={med.description || med.medication?.description}
                    dosage={med.dosage || med.medication?.dosage}
                    price={(med.prix_unitaire / 100).toFixed(2) || (med.medication?.prix / 100).toFixed(2)}
                    availability={med.stock_disponible > 0 ? 'available' : 'unavailable'}
                    pharmacyId={pharmacy.id}
                    pharmacyName={pharmacy.nom}
                    pharmacyAddress={pharmacy.adresse}
                />
            ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default PharmacyCard;