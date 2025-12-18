import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getPharmacies, findPharmaciesByMedications, getMedicationById, ApiPharmacy, ApiMedication } from "@/lib/api";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import MedicationDetailsModal from "@/components/MedicationDetailsModal";
import PharmacyCard from "@/components/PharmacyCard";
import PharmacyFilters, { SortOption, InsuranceFilter } from "@/components/PharmacyFilters";
import MultiSearchModal from "@/components/MultiSearchModal";
import MultiSearchResults from "@/components/MultiSearchResults";
import PharmacyDetailsModal from "@/components/PharmacyDetailsModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Pill, MapPin, Search, ShoppingCart, LocateFixed, Camera, Filter } from "lucide-react";
import { useSearchParams } from "react-router-dom";

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
}

const IndexMobile = () => {
  const [selectedMedication, setSelectedMedication] = useState<ApiMedication | null>(null);
  const [confirmedMedication, setConfirmedMedication] = useState<ApiMedication | null>(null);
  const [confirmedMedications, setConfirmedMedications] = useState<ApiMedication[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("distance");
  const [insuranceFilter, setInsuranceFilter] = useState<InsuranceFilter>("all");
  const [searchMode, setSearchMode] = useState<'single' | 'multiple'>('single');
  const [showMultiModal, setShowMultiModal] = useState(false);
  const [showMultiResults, setShowMultiResults] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);
  const [multiSearchData, setMultiSearchData] = useState<ApiPharmacy[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Geolocation
  const {
    location: userLocation,
    loading: locationLoading,
    error: locationError,
    requestLocation
  } = useGeolocation();

  // Persist medication in URL
  useEffect(() => {
    const medicationId = searchParams.get("medicationId");
    if (medicationId && !confirmedMedication) {
      getMedicationById(parseInt(medicationId, 10))
        .then(med => {
          setConfirmedMedication(med);
        })
        .catch(err => {
          console.error("Failed to fetch persisted medication:", err);
          setSearchParams({}, { replace: true });
        });
    }
  }, [searchParams, confirmedMedication, setSearchParams]);

  // Data fetching
  const { data: singleSearchData, isLoading: isLoadingPharmacies, isError: isErrorPharmacies } = useQuery({
    queryKey: ["pharmacies", userLocation, confirmedMedication?.id],
    queryFn: () => getPharmacies({
      lat: userLocation?.lat,
      lon: userLocation?.lon,
      medicationId: confirmedMedication!.id,
    }),
    enabled: !!userLocation && !!confirmedMedication && searchMode === 'single',
  });

  const multiSearchMutation = useMutation({
    mutationFn: (medicationIds: number[]) => findPharmaciesByMedications(medicationIds),
    onSuccess: (data) => {
      setMultiSearchData(data);
      setShowMultiResults(true);
    },
    onError: (error) => {
      console.error("Multi-search error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de rechercher les médicaments",
        variant: "destructive",
      });
    }
  });

  // Data transformation
  const apiPharmacies = searchMode === 'multiple' ? multiSearchData : singleSearchData;

  const pharmacies = useMemo(() => {
    if (!apiPharmacies) return [];
    return apiPharmacies.map(p => {
      let insurances: string[] = [];
      if (typeof p.assurances_acceptees === 'string') {
        try {
          const parsed = JSON.parse(p.assurances_acceptees);
          if (Array.isArray(parsed)) insurances = parsed;
        } catch (e) { /* ignore parse error */ }
      } else if (Array.isArray(p.assurances_acceptees)) {
        insurances = p.assurances_acceptees;
      }

      return {
        ...p,
        name: p.nom,
        address: p.adresse,
        distance: p.distance_km ? `${p.distance_km.toFixed(1)} km` : "N/A",
        openHours: p.opening_time && p.closing_time ? `${p.opening_time.slice(0, 5)} - ${p.closing_time.slice(0, 5)}` : "Horaires non disponibles",
        isOpen: p.is_open ?? false,
        phone: p.telephone || "Non disponible",
        medicationsAvailable: p.medication_stock ?? 0,
        insurances: insurances,
        rating: parseFloat(p.note) || 0,
        specialInsurance: p.assurance_speciale,
        medicationPrice: p.medication_price,
        medicationsFound: p.match_count,
        totalMedicationsSearched: p.total_meds_in_search,
      };
    });
  }, [apiPharmacies]);

  // Handlers
  const handleMedicationSelect = (medication: ApiMedication) => {
    setSelectedMedication(medication);
    setShowModal(true);
  };

  const handleMedicationConfirm = (medication: ApiMedication) => {
    if (searchMode === 'single') {
      setConfirmedMedication(medication);
      setSearchParams({ medicationId: medication.id.toString() });
    }
  };

  const handleMultipleSearch = (medications: ApiMedication[]) => {
    setConfirmedMedications(medications);
    setSearchMode('multiple');
    const medicationIds = medications.map(m => m.id);
    multiSearchMutation.mutate(medicationIds);
  };

  const handlePharmacyClick = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setShowPharmacyModal(true);
  };

  // Sorting & filtering
  const filteredAndSortedPharmacies = useMemo(() => {
    let result = [...pharmacies];

    // Filter by insurance
    if (insuranceFilter !== "all") {
      result = result.filter(p => {
        if (insuranceFilter === "special" && p.specialInsurance) return true;
        return p.insurances.some(ins =>
          ins.toLowerCase().includes(insuranceFilter.toLowerCase())
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "distance":
          const distA = parseFloat(a.distance) || 999;
          const distB = parseFloat(b.distance) || 999;
          return distA - distB;
        case "price":
          return (a.medicationPrice ?? 999999) - (b.medicationPrice ?? 999999);
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0);
        case "stock":
          return (b.medicationsAvailable ?? 0) - (a.medicationsAvailable || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [pharmacies, sortBy, insuranceFilter]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header simplifié mobile */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Pill className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">PharmFinder</span>
          </div>

          <SearchAutocomplete onMedicationSelect={handleMedicationSelect} />
        </div>
      </header>

      {/* Quick actions */}
      {!confirmedMedication && confirmedMedications.length === 0 && (
        <div className="px-4 py-4 flex gap-2 overflow-x-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowMultiModal(true)}
            className="whitespace-nowrap"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Multiple
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={requestLocation}
            disabled={locationLoading}
            className="whitespace-nowrap"
          >
            <LocateFixed className="w-4 h-4 mr-2" />
            {locationLoading ? "..." : "Ma position"}
          </Button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {confirmedMedication || confirmedMedications.length > 0 ? (
          <div className="px-4 py-4">
            {/* Current search indicator */}
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
              <div className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-1">
                Recherche {searchMode === 'single' ? 'simple' : 'multiple'}
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300">
                {searchMode === 'single'
                  ? confirmedMedication?.nom
                  : `${confirmedMedications.length} médicament(s)`
                }
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setConfirmedMedication(null);
                  setConfirmedMedications([]);
                  setSearchMode('single');
                  setShowMultiResults(false);
                  setSearchParams({}, { replace: true });
                }}
                className="mt-2 h-7 text-xs"
              >
                Nouvelle recherche
              </Button>
            </div>

            {/* Filters */}
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {filteredAndSortedPharmacies.length} pharmacie(s)
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
            </div>

            {showFilters && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <PharmacyFilters
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  insuranceFilter={insuranceFilter}
                  onInsuranceFilterChange={setInsuranceFilter}
                />
              </div>
            )}

            {/* Pharmacies list */}
            {isLoadingPharmacies || multiSearchMutation.isPending ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            ) : isErrorPharmacies ? (
              <div className="text-center py-8">
                <p className="text-destructive">Erreur lors du chargement</p>
              </div>
            ) : filteredAndSortedPharmacies.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Aucune pharmacie trouvée</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAndSortedPharmacies.map((pharmacy) => (
                  <PharmacyCard
                    key={pharmacy.id}
                    pharmacy={pharmacy}
                    onPharmacyClick={() => handlePharmacyClick(pharmacy)}
                    confirmedMedication={confirmedMedication}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Search className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Recherchez un médicament</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Utilisez la barre de recherche pour trouver les pharmacies qui ont votre médicament en stock
            </p>
            {!userLocation && (
              <Button onClick={requestLocation} disabled={locationLoading}>
                <LocateFixed className="w-4 h-4 mr-2" />
                {locationLoading ? "Localisation..." : "Activer ma position"}
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <MedicationDetailsModal
        medication={selectedMedication}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleMedicationConfirm}
      />

      <MultiSearchModal
        isOpen={showMultiModal}
        onClose={() => setShowMultiModal(false)}
        onSearch={handleMultipleSearch}
      />

      {showMultiResults && (
        <MultiSearchResults
          isOpen={showMultiResults}
          onClose={() => setShowMultiResults(false)}
          pharmacies={filteredAndSortedPharmacies}
          selectedMedications={confirmedMedications}
          onPharmacyClick={handlePharmacyClick}
        />
      )}

      <PharmacyDetailsModal
        pharmacy={selectedPharmacy}
        isOpen={showPharmacyModal}
        onClose={() => setShowPharmacyModal(false)}
      />
    </div>
  );
};

export default IndexMobile;
