import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Phone, Star, Shield, Navigation, Calendar, Pill } from "lucide-react";

import { ApiPharmacy, ApiPharmacyMedication } from "@/lib/api";
import { CartItem } from "../pages/Index";

interface Pharmacy extends ApiPharmacy {
  name: string;
  address: string;
  distance: string;
  openHours: string;
  isOpen: boolean;
  phone: string;
  medicationsAvailable: number;
  insurances: string[];
  rating: number;
  specialInsurance: string | null;
  medicationPrice?: number | null;
  medications?: ApiPharmacyMedication[]; // Add medications array
}

interface PharmacyDetailsModalProps {
  pharmacy: Pharmacy | null;
  isOpen: boolean;
  onClose: () => void;
  setPrescriptionItems: React.Dispatch<React.SetStateAction<CartItem[]>>; // New prop
  userLocation: { lat: number; lon: number } | null;
}

const PharmacyDetailsModal = ({
  pharmacy,
  isOpen,
  onClose,
  setPrescriptionItems,
  userLocation,
}: PharmacyDetailsModalProps) => {  if (!pharmacy) return null;

  const handleAddMedicationToPrescription = (medication: ApiPharmacyMedication) => {
    setPrescriptionItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.medicationId === medication.id && item.pharmacyId === pharmacy.id
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += 1;
        return newItems;
      } else {
        return [
          ...prevItems,
          {
            medicationId: medication.id,
            medicationName: medication.nom,
            price: medication.pharmacy_medication_price ? medication.pharmacy_medication_price.toLocaleString('fr-GA', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }) : medication.prix.toLocaleString('fr-GA', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }),
            quantity: 1,
            pharmacyId: pharmacy.id,
            pharmacyName: pharmacy.name,
            pharmacyAddress: pharmacy.address,
          },
        ];
      }
    });
  };

  const handleGetDirections = () => {
    if (pharmacy?.latitude && pharmacy?.longitude) {
      const origin = userLocation ? `${userLocation.lat},${userLocation.lon}` : '';
      const destination = `${pharmacy.latitude},${pharmacy.longitude}`;
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  // Mock additional pharmacy details
  const pharmacyDetails = {
    pharmacist: "Dr. Marie Ngouabi",
    license: "PH-LIB-2019-045",
    openDays: "Lundi - Samedi",
    emergencyHours: "Dimanche: 9h00 - 13h00",
    services: [
      "Conseil pharmaceutique",
      "Tension artérielle",
      "Test de glycémie",
      "Vaccination",
      "Orthopédie"
    ],
    paymentMethods: ["Espèces", "Carte bancaire", "Mobile Money", "Chèque"],
    accessibility: "Accès handicapés disponible",
    parking: "Places de parking gratuites"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl glass-accent-green">
              <MapPin className="h-8 w-8 text-secondary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {pharmacy.name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                {pharmacy.address}
              </DialogDescription>
            </div>
            <Badge 
              variant="outline" 
              className={pharmacy.isOpen 
                ? "bg-secondary/10 text-secondary border-secondary/20" 
                : "bg-destructive/10 text-destructive border-destructive/20"
              }
            >
              {pharmacy.isOpen ? "Ouvert" : "Fermé"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <div className="flex items-center justify-between p-4 glass-accent-pink rounded-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{pharmacy.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{pharmacy.distance}</span>
              </div>
            </div>
            <div className="text-right">
              {pharmacy.rating > 0 && (
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-bold text-foreground">{pharmacy.rating}/5</span>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                {pharmacy.medicationsAvailable} médicaments
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-secondary" />
              <h3 className="font-semibold text-foreground">Horaires d'ouverture</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{pharmacyDetails.openDays}</span>
                <span className="font-medium text-foreground">{pharmacy.openHours}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Urgences</span>
                <span className="font-medium text-foreground">{pharmacyDetails.emergencyHours}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pharmacist */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-secondary" />
              <h3 className="font-semibold text-foreground">Pharmacien titulaire</h3>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">{pharmacyDetails.pharmacist}</p>
              <p className="text-sm text-muted-foreground">Licence: {pharmacyDetails.license}</p>
            </div>
          </div>

          <Separator />

          {/* Insurance */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-secondary" />
              <h3 className="font-semibold text-foreground">Assurances acceptées</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {pharmacy.insurances?.map((insurance, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className={insurance === pharmacy.specialInsurance 
                    ? "bg-accent/20 text-accent-foreground border-accent/30"
                    : "bg-secondary/10 text-secondary border-secondary/20"
                  }
                >
                  {insurance}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Available Medications */}
          {pharmacy.medications && pharmacy.medications.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Pill className="h-5 w-5 text-secondary" />
                <h3 className="font-semibold text-foreground">Médicaments disponibles</h3>
              </div>
              <div className="space-y-3">
                {pharmacy.medications.map((medication) => (
                  <div key={medication.id} className="flex items-center justify-between glass-card p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{medication.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        {medication.pharmacy_medication_price ? medication.pharmacy_medication_price.toLocaleString('fr-GA', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }) : medication.prix.toLocaleString('fr-GA', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 })}
                        {medication.stock !== null && medication.stock !== undefined && ` • Stock: ${medication.stock}`}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddMedicationToPrescription(medication)}
                      className="apple-press"
                    >
                      Ajouter
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Services */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-secondary" />
              <h3 className="font-semibold text-foreground">Services disponibles</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {pharmacyDetails.services.map((service, index) => (
                <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  {service}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Payment & Access */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Modes de paiement</h4>
              <div className="space-y-1">
                {pharmacyDetails.paymentMethods.map((method, index) => (
                  <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    {method}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Accessibilité</h4>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  {pharmacyDetails.accessibility}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  {pharmacyDetails.parking}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 apple-press"
            >
              Fermer
            </Button>
            <Button
              onClick={handleGetDirections}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground apple-press"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Obtenir l'itinéraire
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PharmacyDetailsModal;