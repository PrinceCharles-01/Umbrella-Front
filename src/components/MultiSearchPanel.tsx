import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ShoppingCart, Pill } from "lucide-react";
import SearchAutocomplete from "./SearchAutocomplete";
import MedicationDetailsModal from "./MedicationDetailsModal";

interface Medication {
  id: string;
  name: string;
  description: string;
  dosage: string;  
  category: string;
}

interface MultiSearchPanelProps {
  medications: Medication[];
  onSearch: (medications: Medication[]) => void;
}

const MultiSearchPanel = ({ medications, onSearch }: MultiSearchPanelProps) => {
  const [selectedMedications, setSelectedMedications] = useState<Medication[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentMedication, setCurrentMedication] = useState<Medication | null>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Mock medications for selection
  const mockMedications: Medication[] = [
    {
      id: "1",
      name: "Doliprane 1000mg",
      description: "Antalgique et antipyrétique à base de paracétamol",
      dosage: "1000mg",
      category: "Antalgique"
    },
    {
      id: "2", 
      name: "Aspirine 500mg",
      description: "Anti-inflammatoire non stéroïdien, antalgique et antipyrétique",
      dosage: "500mg",
      category: "AINS"
    },
    {
      id: "3",
      name: "Ibuprofène 400mg", 
      description: "Anti-inflammatoire non stéroïdien pour douleurs et fièvre",
      dosage: "400mg",
      category: "AINS"
    }
  ];

  const handleMedicationSelect = (medication: Medication) => {
    setCurrentMedication(medication);
    setShowModal(true);
  };

  const handleMedicationConfirm = (medication: Medication) => {
    const isAlreadySelected = selectedMedications.some(med => med.id === medication.id);
    if (!isAlreadySelected) {
      setSelectedMedications([...selectedMedications, medication]);
    }
    setShowModal(false);
    setShowAutocomplete(false);
  };

  const removeMedication = (medicationId: string) => {
    setSelectedMedications(selectedMedications.filter(med => med.id !== medicationId));
  };

  const handleSearchPharmacies = () => {
    if (selectedMedications.length > 0) {
      onSearch(selectedMedications);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-xl glass-accent-green">
            <ShoppingCart className="h-6 w-6 text-secondary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Recherche Multiple
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Ajoutez plusieurs médicaments à votre recherche pour trouver les pharmacies qui ont tout en stock.
        </p>
      </div>

      {/* Selected Medications */}
      {selectedMedications.length > 0 && (
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Pill className="h-5 w-5 text-secondary" />
            <h3 className="text-lg font-semibold text-foreground">
              Médicaments sélectionnés ({selectedMedications.length})
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedMedications.map((medication) => (
              <Badge
                key={medication.id}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-2 text-sm glass-accent-pink"
              >
                <span>{medication.name}</span>
                <button
                  onClick={() => removeMedication(medication.id)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowAutocomplete(true)}
              variant="outline"
              className="apple-press"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un médicament
            </Button>
            
            <Button
              onClick={handleSearchPharmacies}
              className="apple-press bg-secondary hover:bg-secondary/90"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Rechercher les pharmacies
            </Button>
          </div>
        </Card>
      )}

      {/* Add Medication */}
      {(selectedMedications.length === 0 || showAutocomplete) && (
        <Card className="glass-card p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              {selectedMedications.length === 0 ? "Premier médicament" : "Ajouter un médicament"}
            </h3>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Sélectionnez un médicament dans la liste ci-dessous :
              </p>
              <div className="grid gap-2">
                {mockMedications
                  .filter(med => !selectedMedications.some(selected => selected.id === med.id))
                  .map((medication) => (
                  <button
                    key={medication.id}
                    onClick={() => handleMedicationSelect(medication)}
                    className="text-left p-3 glass-card hover:bg-secondary/10 rounded-lg apple-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg glass-accent-green">
                        <Pill className="h-4 w-4 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{medication.name}</div>
                        <div className="text-sm text-muted-foreground">{medication.category}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {showAutocomplete && selectedMedications.length > 0 && (
              <Button
                variant="ghost"
                onClick={() => setShowAutocomplete(false)}
                className="apple-press"
              >
                Annuler
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Medication Details Modal */}
      <MedicationDetailsModal
        medication={currentMedication}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleMedicationConfirm}
      />
    </div>
  );
};

export default MultiSearchPanel;