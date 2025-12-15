import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Euro, Shield, Filter, SlidersHorizontal } from "lucide-react";

export type SortOption = "distance" | "price" | "rating" | "availability";
export type InsuranceFilter = "all" | "securite-sociale" | "mutuelle" | "tiers-payant";

interface PharmacyFiltersProps {
  sortBy: SortOption;
  insuranceFilter: InsuranceFilter;
  onSortChange: (sort: SortOption) => void;
  onInsuranceFilterChange: (insurance: InsuranceFilter) => void;
  resultCount: number;
}

const PharmacyFilters = ({
  sortBy,
  insuranceFilter,
  onSortChange,
  onInsuranceFilterChange,
  resultCount
}: PharmacyFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { value: "distance" as const, label: "Distance", icon: MapPin },
    { value: "price" as const, label: "Prix", icon: Euro },
    { value: "rating" as const, label: "Note", icon: Shield },
    { value: "availability" as const, label: "Disponibilité", icon: Filter }
  ];

  const insuranceOptions = [
    { value: "all" as const, label: "Toutes assurances" },
    { value: "securite-sociale" as const, label: "Sécurité Sociale" },
    { value: "mutuelle" as const, label: "Mutuelle acceptée" },
    { value: "tiers-payant" as const, label: "Tiers payant" }
  ];

  return (
    <div className="space-y-4">
      {/* Header with results count and toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-foreground">
            Pharmacies disponibles
          </h3>
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
            {resultCount} résultat{resultCount > 1 ? 's' : ''}
          </Badge>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="apple-press"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {showFilters ? "Masquer" : "Filtres"}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="glass-card p-6 rounded-xl space-y-6 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sort Options */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Trier par
              </label>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="glass w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-glass-border/50">
                  {sortOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Insurance Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Type d'assurance
              </label>
              <Select value={insuranceFilter} onValueChange={onInsuranceFilterChange}>
                <SelectTrigger className="glass w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-glass-border/50">
                  {insuranceOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
              <MapPin className="h-3 w-3 mr-1" />
              {sortOptions.find(opt => opt.value === sortBy)?.label}
            </Badge>
            
            {insuranceFilter !== "all" && (
              <Badge variant="outline" className="bg-accent/50 text-accent-foreground border-accent/30">
                <Shield className="h-3 w-3 mr-1" />
                {insuranceOptions.find(opt => opt.value === insuranceFilter)?.label}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyFilters;