import { useState, useEffect } from "react";
import { Search, Camera, Mic, Clock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getMedications, ApiMedication } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchAutocompleteProps {
  onMedicationSelect: (medication: ApiMedication) => void;
  compact?: boolean;
}

const SearchAutocomplete = ({ onMedicationSelect, onLocationRequest, compact = false }: SearchAutocompleteProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ApiMedication[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: medications, isLoading: isLoadingMedications, isError: isErrorMedications } = useQuery({
    queryKey: ["medications"],
    queryFn: getMedications,
  });

    useEffect(() => {
      if (query.length >= 2 && medications) {
        const filtered = medications.filter(med => 
          med.nom.toLowerCase().includes(query.toLowerCase()) ||
          (med.categorie && med.categorie.toLowerCase().includes(query.toLowerCase()))
        );
        setSuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, [query, medications]);
  
    const handleMedicationClick = (medication: ApiMedication) => {
      setQuery(medication.nom);
      setShowSuggestions(false);
      onMedicationSelect(medication);
    };
  
    return (
      <div className={`w-full relative ${compact ? 'max-w-lg' : 'max-w-2xl mx-auto'}`}>
        <div className={`glass-card rounded-2xl apple-hover ${compact ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center gap-4">
            <Search className={`text-muted-foreground ${compact ? 'h-4 w-4' : 'h-6 w-6'}`} />
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Rechercher un médicament..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`w-full border-0 bg-transparent placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 ${compact ? 'text-base' : 'text-lg'} pr-10`}
              />
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuery('')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full apple-press"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
            {!compact && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="apple-press text-secondary hover:bg-secondary/10"
                  title="Recherche vocale"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="apple-press text-secondary hover:bg-secondary/10"
                  title="Scanner un médicament"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
  
        {isLoadingMedications && (
          <div className="absolute top-full mt-2 w-full glass-card rounded-xl shadow-2xl z-50 animate-fade-in p-4">
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}
  
        {isErrorMedications && (
          <div className="absolute top-full mt-2 w-full glass-card rounded-xl shadow-2xl z-50 animate-fade-in p-4 text-red-500">
            Erreur lors du chargement des médicaments.
          </div>
        )}
  
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && !isLoadingMedications && !isErrorMedications && (
          <div className="absolute top-full mt-2 w-full glass-card rounded-xl shadow-2xl z-50 animate-fade-in">
            <div className="p-2">
              {suggestions.map((medication) => (
                <button
                  key={medication.id}
                  onClick={() => handleMedicationClick(medication)}
                  className="w-full text-left p-4 hover:bg-secondary/10 rounded-lg apple-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg glass-accent-green">
                      <Search className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{medication.nom}</div>
                      <div className="text-sm text-muted-foreground">{medication.categorie}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Recherche rapide
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );};

export default SearchAutocomplete;