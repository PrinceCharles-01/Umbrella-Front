import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Pill, Plus, Search as SearchIcon, Info, Clock, Shield } from "lucide-react";
import SearchAutocomplete from "./SearchAutocomplete";
import { ApiMedication } from "@/lib/api"; // Import ApiMedication

interface MultiSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (medications: ApiMedication[]) => void;
}

const MultiSearchModal = ({ isOpen, onClose, onConfirm }: MultiSearchModalProps) => {
  const [selected, setSelected] = useState<ApiMedication[]>([]);

  const addMedication = (med: Medication) => {
    setSelected((prev) => (prev.some((m) => m.id === med.id) ? prev : [...prev, med]));
  };

  const removeMedication = (id: string) => {
    setSelected((prev) => prev.filter((m) => m.id !== id));
  };

  const clearAll = () => setSelected([]);

  const handleLaunch = () => {
    if (selected.length === 0) return;
    onConfirm(selected);
    onClose();
  };

  const getCategoryColor = (category: string | null | undefined) => {
    if (!category) return "glass-accent-pink"; // Default if category is null or undefined
    const colors = {
      "Antalgiques": "glass-accent-pink",
      "Anti-inflammatoires": "glass-accent-green", 
      "Antibiotiques": "glass-accent-blue",
      "Vitamines": "glass-accent-yellow"
    };
    return colors[category as keyof typeof colors] || "glass-accent-pink";
  };

  const getCategoryIcon = (category: string | null | undefined) => {
    if (!category) return Pill; // Default if category is null or undefined
    const icons = {
      "Antalgiques": Shield,
      "Anti-inflammatoires": Pill,
      "Antibiotiques": Plus,
      "Vitamines": Info
    };
    const IconComponent = icons[category as keyof typeof icons] || Pill;
    return IconComponent;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-border/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl glass-accent-blue shadow-lg">
              <SearchIcon className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Recherche multiple de médicaments</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Ajoutez plusieurs médicaments à votre liste. Vous pourrez ensuite voir quelles pharmacies les ont en stock.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Search input with autocomplete */}
          <div className="glass-card p-6 rounded-xl border border-border/50 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl glass-accent-green shadow-lg">
                <SearchIcon className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Recherche de médicaments</h3>
                <p className="text-sm text-muted-foreground">Tapez le nom du médicament et sélectionnez-le pour l'ajouter à votre liste</p>
              </div>
            </div>
            <SearchAutocomplete onMedicationSelect={addMedication} onLocationRequest={() => {}} />
          </div>

          {/* Selected medications list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg glass-accent-pink shadow-sm">
                  <Pill className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground">Médicaments sélectionnés</h4>
                  <p className="text-sm text-muted-foreground">
                    {selected.length} médicament{selected.length > 1 ? 's' : ''} dans votre liste
                    {selected.length > 0 && " • Cliquez sur un médicament pour voir sa fiche"}
                  </p>
                </div>
              </div>
              {selected.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAll} 
                  className="apple-press text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Tout effacer
                </Button>
              )}
            </div>

            {selected.length === 0 ? (
              <div className="glass-card p-12 rounded-xl text-center border border-dashed border-border/50">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full glass-accent-blue flex items-center justify-center shadow-lg">
                  <SearchIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Aucun médicament sélectionné</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Commencez par rechercher un médicament dans la barre de recherche ci-dessus. 
                  Vous pourrez ensuite voir quelles pharmacies ont tous vos médicaments en stock.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {selected.map((med, index) => {
                  const CategoryIcon = getCategoryIcon(med.category);
                  return (
                    <div 
                      key={med.id} 
                      className="glass-card p-5 rounded-xl border border-border/30 hover:border-border/60 transition-all duration-200 hover:shadow-md group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full glass-accent-green flex items-center justify-center text-sm font-bold text-accent-foreground shadow-sm">
                            {index + 1}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h5 
                                  className="text-lg font-semibold text-foreground cursor-default"
                                >
                                  {med.nom}
                                </h5>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs border-0 text-accent-foreground ${getCategoryColor(med.categorie)} shadow-sm`}
                                >
                                  <CategoryIcon className="h-3 w-3 mr-1" />
                                  {med.categorie}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{med.description}</p>
                            </div>
                            
                            <button 
                              onClick={() => removeMedication(med.id)} 
                              className="flex-shrink-0 p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-200 opacity-60 group-hover:opacity-100"
                              aria-label={`Retirer ${med.nom}`}
                              title={`Retirer ${med.nom} de la liste`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-6 text-xs">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-3 w-3 text-secondary" />
                              <span>Dosage: <span className="font-medium">{med.dosage}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Info className="h-3 w-3 text-accent" />
                              <span className="italic">Cliquez sur le nom pour voir la fiche complète</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border/20">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selected.length > 0 && (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  {selected.length} médicament{selected.length > 1 ? 's' : ''} prêt{selected.length > 1 ? 's' : ''} pour la recherche
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} className="apple-press px-6">
                Annuler
              </Button>
              <Button 
                onClick={handleLaunch} 
                disabled={selected.length === 0} 
                className={`apple-press px-8 transition-all duration-200 ${
                  selected.length === 0 
                    ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                    : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg hover:shadow-xl'
                }`}
              >
                <SearchIcon className="h-4 w-4 mr-2" />
                Lancer la recherche ({selected.length})
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MultiSearchModal;