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
import { Pill, AlertTriangle, Info, Clock, Shield } from "lucide-react";

interface Medication {
  id: number;
  nom: string;
  description: string | null;
  dosage: string | null;
  categorie: string | null;
  prix: number;
  created_at: string;
  updated_at: string;
}

interface MedicationDetailsModalProps {
  medication: Medication | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (medication: Medication) => void;
}

const MedicationDetailsModal = ({ 
  medication, 
  isOpen, 
  onClose, 
  onConfirm 
}: MedicationDetailsModalProps) => {
  if (!medication) return null;

  // Mock detailed information
  const medicationDetails = {
    activeIngredient: medication.nom.includes("Doliprane") || medication.nom.includes("Dafalgan") 
      ? "Paracétamol" 
      : medication.nom.includes("Aspirine") 
      ? "Acide acétylsalicylique"
      : medication.nom.includes("Ibuprofène") || medication.nom.includes("Advil")
      ? "Ibuprofène" 
      : "Phloroglucinol",
    
    indications: [
      "Douleurs légères à modérées",
      "Fièvre", 
      "Maux de tête",
      "Douleurs dentaires"
    ],
    
    sideEffects: [
      "Nausées occasionnelles",
      "Troubles digestifs légers", 
      "Réactions allergiques rares",
      "Somnolence possible"
    ],
    
    contraindications: [
      "Allergie aux composants",
      "Insuffisance hépatique sévère",
      "Ulcère gastro-duodénal évolutif"
    ],
    
    posology: "1 comprimé toutes les 6-8 heures, sans dépasser 3 g/jour",
    
    laboratory: "Sanofi-Aventis",
    
    price: "2 450 FCFA"
  };

  const handleConfirm = () => {
    onConfirm(medication);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl glass-accent-pink">
              <Pill className="h-8 w-8 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {medication.nom}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                {medication.description}
              </DialogDescription>
            </div>
            <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
              {medication.categorie}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Price and Laboratory */}
          <div className="flex items-center justify-between p-4 glass-accent-green rounded-xl">
            <div>
              <div className="text-sm text-muted-foreground">Prix moyen</div>
              <div className="text-2xl font-bold text-foreground">{medicationDetails.price}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Laboratoire</div>
              <div className="font-semibold text-foreground">{medicationDetails.laboratory}</div>
            </div>
          </div>

          {/* Active Ingredient */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-secondary" />
              <h3 className="font-semibold text-foreground">Principe actif</h3>
            </div>
            <p className="text-muted-foreground">{medicationDetails.activeIngredient}</p>
          </div>

          <Separator />

          {/* Indications */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-secondary" />
              <h3 className="font-semibold text-foreground">Indications</h3>
            </div>
            <ul className="space-y-2">
              {medicationDetails.indications.map((indication, index) => (
                <li key={index} className="text-muted-foreground text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  {indication}
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Posology */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-secondary" />
              <h3 className="font-semibold text-foreground">Posologie</h3>
            </div>
            <p className="text-muted-foreground">{medicationDetails.posology}</p>
          </div>

          <Separator />

          {/* Side Effects */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-foreground">Effets secondaires possibles</h3>
            </div>
            <ul className="space-y-2">
              {medicationDetails.sideEffects.map((effect, index) => (
                <li key={index} className="text-muted-foreground text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {effect}
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Contraindications */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-foreground">Contre-indications</h3>
            </div>
            <ul className="space-y-2">
              {medicationDetails.contraindications.map((contraindication, index) => (
                <li key={index} className="text-muted-foreground text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  {contraindication}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 apple-press"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground apple-press"
            >
              Oui, c'est ce médicament
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MedicationDetailsModal;