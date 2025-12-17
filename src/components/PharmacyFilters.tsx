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
    <div className="space-y-3 sm:space-y-4">
      {/* Header with results count and toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <h3 className="text-base sm:text-xl font-semibold text-foreground">
            Pharmacies disponibles
          </h3>
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 text-xs self-start whitespace-nowrap">
            {resultCount} résultat{resultCount > 1 ? 's' : ''}
          </Badge>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="apple-press w-full sm:w-auto text-xs sm:text-sm"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2 flex-shrink-0" />
          {showFilters ? "Masquer" : "Filtres"}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="glass-card p-4 sm:p-6 rounded-xl space-y-4 sm:space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Sort Options */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3 block">
                Trier par
              </label>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="glass w-full text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-glass-border/50">
                  {sortOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value} className="text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Insurance Filter */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3 block">
                Type d'assurance
              </label>
              <Select value={insuranceFilter} onValueChange={onInsuranceFilterChange}>
                <SelectTrigger className="glass w-full text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-glass-border/50">
                  {insuranceOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
            </Badge>

            {insuranceFilter !== "all" && (
              <Badge variant="outline" className="bg-accent/50 text-accent-foreground border-accent/30 text-xs">
                <Shield className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{insuranceOptions.find(opt => opt.value === insuranceFilter)?.label}</span>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyFilters;