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
import { Pill, MapPin, Search, ShoppingCart, User, Building2, LocateFixed, AlertTriangle, Camera } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

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

const Index = () => {
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Geolocation avec persistance (24h)
  const {
    location: userLocation,
    loading: locationLoading,
    error: locationError,
    requestLocation
  } = useGeolocation();

  // --- State Persistence Effect ---
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

  // --- Data Fetching with TanStack Query ---
  const { data: singleSearchData, isLoading: isLoadingPharmacies, isError: isErrorPharmacies, error: queryError } = useQuery({
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
    }
  });

  // --- Data Transformation ---
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
        medicationsFound: p.match_count, // Use match_count from API
        totalMedicationsSearched: p.total_meds_in_search, // Use total_meds_in_search from API
      };
    });
  }, [apiPharmacies]);

  // Handle medication selection from autocomplete
  const handleMedicationSelect = (medication: ApiMedication) => {
    setSelectedMedication(medication);
    setShowModal(true);
  };

  // Handle medication confirmation from modal
  const handleMedicationConfirm = (medication: ApiMedication) => {
    if (searchMode === 'single') {
      setConfirmedMedication(medication);
      setSearchParams({ medicationId: medication.id.toString() });
    }
  };

  // Handle multiple medications search
  const handleMultipleSearch = (medications: ApiMedication[]) => {
    setConfirmedMedications(medications);
    setSearchMode('multiple');
    const medicationIds = medications.map(m => m.id);
    multiSearchMutation.mutate(medicationIds);
    setShowMultiModal(false);
  };

  const handleBackFromMultiResults = () => {
    setShowMultiResults(false);
    setConfirmedMedications([]);
    setMultiSearchData([]);
    setSearchMode('single');
  };

  const handlePharmacyDetails = (pharmacy: any) => {
    setSelectedPharmacy(pharmacy);
    setShowPharmacyModal(true);
  };

  // Sort pharmacies based on selected criteria
  const sortedPharmacies = useMemo(() => {
    let sortablePharmacies = [...pharmacies];

    if (searchMode === 'multiple') {
      // For multiple search, prioritize by medications found
      sortablePharmacies.sort((a, b) => (b.medicationsFound ?? 0) - (a.medicationsFound ?? 0));
    }
    
    return sortablePharmacies.sort((a, b) => {
      switch (sortBy) {
        case "distance":
          if (a.distance === "N/A") return 1;
          if (b.distance === "N/A") return -1;
          return parseFloat(a.distance) - parseFloat(b.distance);
        case "price":
          const priceA = a.medicationPrice ?? Infinity;
          const priceB = b.medicationPrice ?? Infinity;
          return priceA - priceB;
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0); // Use real rating
        case "availability":
          return (b.medicationsAvailable ?? 0) - (a.medicationsAvailable || 0);
        default:
          return 0;
      }
    });
  }, [pharmacies, searchMode, sortBy]);

  // Show Multi Search Results if active
  if (showMultiResults && confirmedMedications.length > 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="glass-header sticky top-0 z-50 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary">
                <Pill className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">PharmFinder</h1>
                <p className="text-sm text-muted-foreground">Trouvez vos médicaments</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <MultiSearchResults 
            searchedMedications={confirmedMedications}
            pharmacies={pharmacies}
            onBack={handleBackFromMultiResults}
          />
        </main>

        <footer className="bg-background border-t border-border/50 mt-20">
          <div className="max-w-7xl mx-auto px-6 py-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} PharmFinder. Tous droits réservés.</p>
            <div className="flex justify-center gap-4 mt-4">
              <Link to="/mentions-legales" className="text-sm hover:text-primary transition-colors">Mentions Légales</Link>
              <Link to="/register-pharmacy" className="text-sm hover:text-primary transition-colors">Référencer ma pharmacie</Link>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary">
              <Pill className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">PharmFinder</h1>
              <p className="text-sm text-muted-foreground">Trouvez vos médicaments</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {!confirmedMedication && confirmedMedications.length === 0 ? (
          /* Hero Section with Autocomplete */
          <div className="text-center space-y-8 py-20">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Trouvez vos
                <span className="text-secondary"> médicaments</span>
                <br />en quelques secondes
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Recherchez un médicament et découvrez instantanément les pharmacies à proximité qui le proposent.
              </p>
            </div>

            <SearchAutocomplete 
              onMedicationSelect={handleMedicationSelect} 
            />

            <div className="flex justify-center gap-4 pt-8 flex-wrap">
              <Button
                variant="outline"
                onClick={() => navigate('/scan')}
                className="btn-apple-squared flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Scanner une ordonnance
              </Button>

              <Button
                onClick={() => setShowMultiModal(true)}
                className="btn-apple-rounded bg-secondary text-secondary-foreground flex items-center gap-2 glow-on-hover"
              >
                <ShoppingCart className="h-4 w-4" />
                Recherche Multiple
              </Button>

              {!userLocation && (
                <Button
                  variant="outline"
                  onClick={requestLocation}
                  className="btn-apple-squared flex items-center gap-2"
                  disabled={locationLoading}
                >
                  <LocateFixed className="h-4 w-4" />
                  {locationLoading ? "Recherche..." : "Utiliser ma position"}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => window.location.href = '/admin'}
                className="btn-apple-squared flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Administration
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 pt-16">
              <div className="glass-accent-green p-6 rounded-xl text-center lift-hover">
                <Search className="h-8 w-8 text-secondary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Recherche intelligente</h3>
                <p className="text-sm text-muted-foreground">
                  Trouvez rapidement le médicament que vous cherchez
                </p>
              </div>

              <div className="glass-card p-6 rounded-xl text-center lift-hover">
                <MapPin className="h-8 w-8 text-secondary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Géolocalisation</h3>
                <p className="text-sm text-muted-foreground">
                  Pharmacies les plus proches de votre position
                </p>
              </div>

              <div className="glass-accent-pink p-6 rounded-xl text-center lift-hover">
                <Pill className="h-8 w-8 text-accent-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Stock en temps réel</h3>
                <p className="text-sm text-muted-foreground">
                  Disponibilité mise à jour en continu
                </p>
              </div>
            </div>
          </div>
) : (
          /* Pharmacy Results Section */
          <div className="space-y-8">
            {/* Search Header */}
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setConfirmedMedication(null);
                  setConfirmedMedications([]);
                  setSearchMode('single');
                  setSearchParams({}, { replace: true });
                }}
                className="apple-press"
              >
                ← Nouvelle recherche
              </Button>
              <div className="flex-1">
                {searchMode === 'single' && confirmedMedication ? (
                  <>
                    <h2 className="text-2xl font-bold text-foreground">
                      Pharmacies pour "{confirmedMedication.nom}"
                    </h2>
                    <p className="text-muted-foreground">
                      Médicament confirmé • {sortedPharmacies.length} pharmacies trouvées
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-foreground">
                      Pharmacies pour {confirmedMedications.length} médicaments
                    </h2>
                    <p className="text-muted-foreground">
                      Recherche multiple • {sortedPharmacies.length} pharmacies analysées
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Selected Medication(s) Card */}
            <div className="glass-accent-pink p-6 rounded-xl">
              {searchMode === 'single' && confirmedMedication ? (
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl glass-accent-green">
                    <Pill className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {confirmedMedication.nom}
                    </h3>
                    <p className="text-muted-foreground">
                      {confirmedMedication.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowModal(true)}
                    className="apple-press"
                  >
                    Voir détails
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl glass-accent-green">
                      <ShoppingCart className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {confirmedMedications.length} médicaments sélectionnés
                      </h3>
                      <p className="text-muted-foreground">
                        Recherche dans toutes les pharmacies disponibles
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {confirmedMedications.map((med, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-background/50 rounded-lg text-sm font-medium text-foreground"
                      >
                        {med.nom}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            <PharmacyFilters
              sortBy={sortBy}
              insuranceFilter={insuranceFilter}
              onSortChange={setSortBy}
              onInsuranceFilterChange={setInsuranceFilter}
              resultCount={sortedPharmacies.length}
            />

            {/* Pharmacies List */}
            {!userLocation && !locationError ? (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-background rounded-lg shadow-inner">
                  <LocateFixed className="h-12 w-12 text-primary mb-4 animate-pulse" />
                  <h3 className="font-semibold text-lg">Recherche de votre position...</h3>
                  <p className="text-muted-foreground">Veuillez autoriser la géolocalisation pour trouver les pharmacies proches de vous.</p>
              </div>
            ) : isLoadingPharmacies ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : isErrorPharmacies || locationError ? (
              <div className="bg-destructive/10 border border-destructive/50 text-destructive p-4 rounded-lg flex flex-col items-center gap-4 text-center">
                <AlertTriangle className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">{isErrorPharmacies ? "Erreur de connexion au serveur" : "Erreur de géolocalisation"}</h3>
                  <p className="text-sm">{isErrorPharmacies ? "Impossible de récupérer la liste des pharmacies." : locationError}</p>
                  {isErrorPharmacies && <p className="text-xs mt-2 text-muted-foreground">Détail: {queryError?.message}</p>}
                </div>
                {locationError && (
                  <Button onClick={requestLocation} size="sm" className="mt-2" disabled={locationLoading}>
                    <LocateFixed className="h-4 w-4 mr-2" />
                    {locationLoading ? "Recherche..." : "Réessayer"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedPharmacies.map((pharmacy, index) => (
                  <div key={index} className="space-y-2">
                    {searchMode === 'multiple' && (
                      <div className="text-sm text-muted-foreground px-4">
                        {pharmacy.medicationsFound === pharmacy.totalMedicationsSearched ? (
                          <span className="text-green-600 font-medium">
                            ✓ Tous les médicaments disponibles ({pharmacy.medicationsFound}/{pharmacy.totalMedicationsSearched})
                          </span>
                        ) : (
                          <span className="text-orange-600 font-medium">
                            {pharmacy.medicationsFound}/{pharmacy.totalMedicationsSearched} médicaments disponibles
                            {(pharmacy.totalMedicationsSearched ?? 0) - (pharmacy.medicationsFound ?? 0) > 0 && (
                              <span className="text-red-600"> • {(pharmacy.totalMedicationsSearched ?? 0) - (pharmacy.medicationsFound ?? 0)} manquant(s)</span>
                            )}
                          </span>
                        )}
                      </div>
                    )}
                    <PharmacyCard 
                      {...pharmacy} 
                      onViewDetails={() => handlePharmacyDetails(pharmacy)} 
                      userLocation={userLocation}
                      confirmedMedication={confirmedMedication}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <MultiSearchModal
        isOpen={showMultiModal}
        onClose={() => setShowMultiModal(false)}
        onConfirm={handleMultipleSearch}
      />
      <MedicationDetailsModal
        medication={selectedMedication}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleMedicationConfirm}
      />

      <PharmacyDetailsModal
        pharmacy={selectedPharmacy}
        isOpen={showPharmacyModal}
        onClose={() => setShowPharmacyModal(false)}
        userLocation={userLocation}
      />

      <footer className="bg-background border-t border-border/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PharmFinder. Tous droits réservés.</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link to="/mentions-legales" className="text-sm hover:text-primary transition-colors">Mentions Légales</Link>
            <Link to="/register-pharmacy" className="text-sm hover:text-primary transition-colors">Référencer ma pharmacie</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
