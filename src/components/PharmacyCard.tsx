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
      <Card className="card-apple p-6 lift-hover">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg">
                {pharmacy.nom}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{pharmacy.adresse}</span>
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end gap-1">
              <div className="text-sm font-medium text-foreground">
                {pharmacy.distance_km ? `${pharmacy.distance_km.toFixed(1)} km` : ""}
              </div>
              <Badge 
                variant="outline" 
                className={pharmacy.is_open 
                  ? "bg-secondary/10 text-secondary border-secondary/20" 
                  : "bg-destructive/10 text-destructive border-destructive/20"
                }
              >
                {pharmacy.is_open ? "Ouvert" : "Fermé"}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{pharmacy.opening_time && pharmacy.closing_time ? `${pharmacy.opening_time.slice(0, 5)} - ${pharmacy.closing_time.slice(0, 5)}` : "N/A"}</span>
                </div>
                {pharmacy.telephone && (
                    <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{pharmacy.telephone}</span>
                    </div>
                )}
                {pharmacy.note && parseFloat(pharmacy.note) > 0 && (
                    <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium text-foreground">{parseFloat(pharmacy.note).toFixed(1)}</span>
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                <Button 
                variant="ghost" 
                size="sm"
                onClick={onViewDetails}
                className="apple-press"
                >
                Détails
                </Button>
                <Button 
                variant="outline" 
                size="sm"
                onClick={handleGetDirections}
                className="apple-press hover:bg-secondary/10 hover:border-secondary/30"
                >
                <Navigation className="h-4 w-4 mr-2" />
                Itinéraire
                </Button>
            </div>
          </div>

          {medicationsToDisplay.length > 0 && (
            <CollapsibleTrigger asChild>
                <Button variant="link" className="w-full justify-center items-center gap-2 text-secondary">
                    Voir les {medicationsToDisplay.length} médicaments disponibles
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
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