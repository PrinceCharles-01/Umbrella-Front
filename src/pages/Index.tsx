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
import { Pill, MapPin, Search, ShoppingCart, Building2, LocateFixed, AlertTriangle, Camera, Sparkles, Zap, Shield, Menu, X, ChevronLeft, ChevronRight, Star, Clock, CheckCircle2, ArrowRight, Download, Smartphone } from "lucide-react";
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

  // UI States for landing page
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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
        medicationsFound: p.match_count,
        totalMedicationsSearched: p.total_meds_in_search,
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
          return (b.rating ?? 0) - (a.rating ?? 0);
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
        <header className="header-modern">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">PharmFinder</span>
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

        <footer className="border-t border-border/50 mt-12 sm:mt-16 md:mt-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-muted-foreground text-xs sm:text-sm">
            <p>&copy; {new Date().getFullYear()} PharmFinder. Tous droits réservés.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-4">
              <Link to="/mentions-legales" className="hover:text-foreground transition-colors">Mentions Légales</Link>
              <Link to="/register-pharmacy" className="hover:text-foreground transition-colors">Référencer ma pharmacie</Link>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ============================================
          🎨 HEADER RESPONSIVE AVEC MENU MOBILE
          ============================================ */}
      <header className="header-modern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">PharmFinder</span>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Fonctionnalités
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Comment ça marche
            </a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Témoignages
            </a>
            <a href="#" onClick={() => navigate('/scan')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Scanner
            </a>
          </nav>

          {/* CTA Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/admin'}
            >
              Administration
            </Button>
            <Button
              size="sm"
              className="btn-primary"
              onClick={requestLocation}
              disabled={locationLoading}
            >
              {locationLoading ? "Localisation..." : "Commencer"}
            </Button>
          </div>

          {/* Mobile: CTA + Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              size="sm"
              className="btn-primary text-xs sm:text-sm px-3 sm:px-4"
              onClick={requestLocation}
              disabled={locationLoading}
            >
              {locationLoading ? "..." : "Commencer"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg z-50 fade-in">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Fonctionnalités
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Comment ça marche
              </a>
              <a
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Témoignages
              </a>
              <a
                href="#"
                onClick={() => { setMobileMenuOpen(false); navigate('/scan'); }}
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Scanner
              </a>
              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setMobileMenuOpen(false); window.location.href = '/admin'; }}
                >
                  Administration
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ============================================
          ✨ MAIN CONTENT
          ============================================ */}
      <main>
        {!confirmedMedication && confirmedMedications.length === 0 ? (
          /* ============================================
             🎯 HERO SECTION SOPHISTIQUÉE
             ============================================ */
          <>
            <section className="relative overflow-hidden">
              {/* Gradient Background */}
              <div className="absolute inset-0 hero-gradient" />

              {/* Grid Pattern (subtil) */}
              <div className="absolute inset-0 grid-pattern opacity-[0.02]" />

              <div className="relative z-10 px-4 sm:px-6 py-16 sm:py-20 md:py-24 lg:py-32">
                <div className="max-w-4xl mx-auto text-center">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-6 sm:mb-8 fade-in-up">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                    <span className="text-xs sm:text-sm font-medium text-emerald-700">Recherche en temps réel</span>
                  </div>

                  {/* Hero Title - Ultra Responsive */}
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-tight mb-4 sm:mb-6 fade-in-up" style={{ animationDelay: '0.1s', letterSpacing: '-0.02em' }}>
                    Trouvez vos médicaments
                    <span className="gradient-text-emerald"> en un clic</span>
                  </h1>

                  {/* Hero Subtitle - Responsive */}
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4 fade-in-up" style={{ animationDelay: '0.2s' }}>
                    Localisez instantanément les pharmacies qui ont vos médicaments en stock.
                    Simple, rapide, intelligent.
                  </p>

                  {/* Search Box - Responsive */}
                  <div className="max-w-2xl mx-auto mb-6 sm:mb-8 px-4 fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <SearchAutocomplete
                      onMedicationSelect={handleMedicationSelect}
                    />
                  </div>

                  {/* CTA Buttons - Stacked on mobile, inline on desktop */}
                  <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4 fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <Button
                      onClick={() => navigate('/scan')}
                      className="btn-secondary scale-hover w-full sm:w-auto"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Scanner une ordonnance
                    </Button>

                    <Button
                      onClick={() => setShowMultiModal(true)}
                      className="btn-pink scale-hover w-full sm:w-auto"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Recherche Multiple
                    </Button>

                    {!userLocation && (
                      <Button
                        variant="ghost"
                        onClick={requestLocation}
                        disabled={locationLoading}
                        className="scale-hover w-full sm:w-auto"
                      >
                        <LocateFixed className="w-4 h-4 mr-2" />
                        {locationLoading ? "Localisation..." : "Ma position"}
                      </Button>
                    )}
                  </div>

                  {/* Stats - Responsive Grid */}
                  <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-3xl mx-auto px-4 fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <div>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">500+</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Médicaments</div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">50+</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Pharmacies</div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">24/7</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Disponible</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================
               🎨 FEATURES SECTION - RESPONSIVE
               ============================================ */}
            <section id="features" className="px-4 sm:px-6 py-16 sm:py-20 md:py-24 bg-white">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 sm:mb-16">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
                    Pourquoi choisir <span className="gradient-text-emerald">PharmFinder</span> ?
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                    La solution la plus simple et rapide pour trouver vos médicaments au Gabon
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 stagger-container">
                  {/* Feature 1 */}
                  <div className="feature-card group">
                    <div className="feature-icon">
                      <Search className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      Recherche Intelligente
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Trouvez n'importe quel médicament en quelques secondes grâce à notre moteur de recherche avancé avec autocomplétion.
                    </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="feature-card group">
                    <div className="feature-icon">
                      <MapPin className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      Géolocalisation Précise
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Localisez instantanément les pharmacies les plus proches de vous avec itinéraire en temps réel.
                    </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="feature-card group">
                    <div className="feature-icon">
                      <Zap className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      Stock en Temps Réel
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Consultez la disponibilité des médicaments en temps réel et comparez les prix entre pharmacies.
                    </p>
                  </div>

                  {/* Feature 4 */}
                  <div className="feature-card group">
                    <div className="feature-icon">
                      <Camera className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      Scan d'Ordonnance
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Scannez votre ordonnance et obtenez instantanément la liste des médicaments à rechercher.
                    </p>
                  </div>

                  {/* Feature 5 */}
                  <div className="feature-card group">
                    <div className="feature-icon">
                      <Shield className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      Sécurisé & Fiable
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Informations vérifiées et mises à jour en continu. Vos données personnelles sont protégées.
                    </p>
                  </div>

                  {/* Feature 6 */}
                  <div className="feature-card group">
                    <div className="feature-icon">
                      <ShoppingCart className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      Recherche Multiple
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Recherchez plusieurs médicaments simultanément et trouvez la pharmacie qui les a tous en stock.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================
               📍 HOW IT WORKS - 3 STEPS
               ============================================ */}
            <section id="how-it-works" className="px-4 sm:px-6 py-16 sm:py-20 md:py-24 bg-muted/30">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 sm:mb-16">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
                    Comment ça marche ?
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                    Trois étapes simples pour trouver vos médicaments
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
                  {/* Step 1 */}
                  <div className="relative text-center group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform duration-300 group-hover:scale-110">
                      <span className="text-2xl sm:text-3xl font-bold text-white">1</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
                      Recherchez
                    </h3>
                    <p className="text-muted-foreground leading-relaxed px-2">
                      Tapez le nom de votre médicament ou scannez votre ordonnance
                    </p>
                    {/* Arrow for desktop */}
                    <ArrowRight className="hidden lg:block absolute top-10 -right-6 w-8 h-8 text-emerald-300" />
                  </div>

                  {/* Step 2 */}
                  <div className="relative text-center group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/30 transition-transform duration-300 group-hover:scale-110">
                      <span className="text-2xl sm:text-3xl font-bold text-white">2</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
                      Localisez
                    </h3>
                    <p className="text-muted-foreground leading-relaxed px-2">
                      Consultez la liste des pharmacies qui ont votre médicament en stock
                    </p>
                    <ArrowRight className="hidden lg:block absolute top-10 -right-6 w-8 h-8 text-pink-300" />
                  </div>

                  {/* Step 3 */}
                  <div className="relative text-center group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-transform duration-300 group-hover:scale-110">
                      <span className="text-2xl sm:text-3xl font-bold text-white">3</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
                      Récupérez
                    </h3>
                    <p className="text-muted-foreground leading-relaxed px-2">
                      Obtenez l'itinéraire et récupérez votre médicament en toute simplicité
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================
               💬 TESTIMONIALS CAROUSEL
               ============================================ */}
            <section id="testimonials" className="px-4 sm:px-6 py-16 sm:py-20 md:py-24 bg-white">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 sm:mb-16">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
                    Ils nous font <span className="gradient-text-pink">confiance</span>
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                    Des milliers d'utilisateurs satisfaits au Gabon
                  </p>
                </div>

                {/* Testimonials Grid - Responsive */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {/* Testimonial 1 */}
                  <div className="glass-card p-6 sm:p-8 lift-hover">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed text-sm sm:text-base">
                      "Application géniale ! J'ai trouvé mon médicament en moins de 5 minutes. Plus besoin de faire le tour des pharmacies."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                        MK
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm sm:text-base">Marie Koumba</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Libreville</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 2 */}
                  <div className="glass-card p-6 sm:p-8 lift-hover">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed text-sm sm:text-base">
                      "Super pratique ! La géolocalisation fonctionne parfaitement et les prix sont affichés clairement."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                        JB
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm sm:text-base">Jean Bongo</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Port-Gentil</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 3 */}
                  <div className="glass-card p-6 sm:p-8 lift-hover sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed text-sm sm:text-base">
                      "Le scan d'ordonnance est magique ! Gain de temps incroyable pour trouver plusieurs médicaments."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                        EN
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm sm:text-base">Estelle Ndong</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Franceville</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================
               🏥 PARTNER PHARMACIES - DYNAMIC CARDS
               ============================================ */}
            <section className="px-4 sm:px-6 py-16 sm:py-20 md:py-24 bg-gradient-to-br from-emerald-50 to-pink-50">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 sm:mb-16">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
                    Nos pharmacies <span className="gradient-text-emerald">partenaires</span>
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                    Un réseau de confiance au service de votre santé
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                  {/* Pharmacy Card 1 */}
                  <div className="card-modern bg-white group cursor-pointer">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                      <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                      Pharmacie Centrale
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">Libreville</p>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-600 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>50+ médicaments</span>
                    </div>
                  </div>

                  {/* Pharmacy Card 2 */}
                  <div className="card-modern bg-white group cursor-pointer">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-200 transition-colors">
                      <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-pink-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                      Pharmacie du Soleil
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">Port-Gentil</p>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-pink-600 font-medium">
                      <Clock className="w-4 h-4" />
                      <span>Ouvert 24/7</span>
                    </div>
                  </div>

                  {/* Pharmacy Card 3 */}
                  <div className="card-modern bg-white group cursor-pointer">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                      <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                      Pharmacie de la Paix
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">Franceville</p>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-indigo-600 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>35+ médicaments</span>
                    </div>
                  </div>

                  {/* Pharmacy Card 4 - Call to action */}
                  <div className="card-modern bg-gradient-to-br from-emerald-500 to-emerald-600 text-white group cursor-pointer flex flex-col justify-center items-center text-center">
                    <Building2 className="w-10 h-10 sm:w-12 sm:h-12 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                      Rejoignez-nous
                    </h3>
                    <p className="text-sm text-emerald-50 mb-4 px-4">
                      Vous êtes pharmacien ?
                    </p>
                    <Link
                      to="/register-pharmacy"
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                    >
                      En savoir plus →
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================
               🚀 FINAL CTA SECTION
               ============================================ */}
            <section className="px-4 sm:px-6 py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 px-4">
                  Prêt à trouver vos médicaments ?
                </h2>
                <p className="text-base sm:text-lg text-gray-300 mb-8 sm:mb-10 px-4">
                  Rejoignez des milliers d'utilisateurs qui gagnent du temps chaque jour
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                  <Button
                    size="lg"
                    className="btn-primary text-base w-full sm:w-auto"
                    onClick={requestLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading ? "Localisation..." : "Commencer maintenant"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-base w-full sm:w-auto"
                    onClick={() => navigate('/scan')}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Scanner une ordonnance
                  </Button>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* ============================================
             📋 RESULTS SECTION
             ============================================ */
          <div className="section-container-sm">
            <div className="space-y-8">
              {/* Search Header */}
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setConfirmedMedication(null);
                    setConfirmedMedications([]);
                    setSearchMode('single');
                    setSearchParams({}, { replace: true });
                  }}
                  className="w-fit"
                >
                  ← Nouvelle recherche
                </Button>
                <div className="flex-1">
                  {searchMode === 'single' && confirmedMedication ? (
                    <>
                      <h2 className="text-3xl font-bold text-foreground mb-2">
                        Résultats pour "{confirmedMedication.nom}"
                      </h2>
                      <p className="text-muted-foreground">
                        {sortedPharmacies.length} pharmacies trouvées
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold text-foreground mb-2">
                        Résultats pour {confirmedMedications.length} médicaments
                      </h2>
                      <p className="text-muted-foreground">
                        {sortedPharmacies.length} pharmacies analysées
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Selected Medication(s) Card */}
              <div className="glass-card p-6">
                {searchMode === 'single' && confirmedMedication ? (
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-50">
                      <Pill className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {confirmedMedication.nom}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {confirmedMedication.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowModal(true)}
                    >
                      Voir détails
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-pink-50">
                        <ShoppingCart className="h-6 w-6 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {confirmedMedications.length} médicaments sélectionnés
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Recherche dans toutes les pharmacies disponibles
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {confirmedMedications.map((med, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-muted rounded-lg text-sm font-medium text-foreground"
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
                <div className="glass-card p-12 text-center">
                  <LocateFixed className="h-12 w-12 text-emerald-500 mx-auto mb-4 pulse-gentle" />
                  <h3 className="text-lg font-semibold mb-2">Recherche de votre position...</h3>
                  <p className="text-muted-foreground">Veuillez autoriser la géolocalisation pour trouver les pharmacies proches de vous.</p>
                </div>
              ) : isLoadingPharmacies ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : isErrorPharmacies || locationError ? (
                <div className="glass-card p-8 text-center border-destructive/50">
                  <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{isErrorPharmacies ? "Erreur de connexion" : "Erreur de géolocalisation"}</h3>
                  <p className="text-muted-foreground mb-4">{isErrorPharmacies ? "Impossible de récupérer la liste des pharmacies." : locationError}</p>
                  {locationError && (
                    <Button onClick={requestLocation} size="sm" disabled={locationLoading}>
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
                            <span className="text-emerald-600 font-medium">
                              ✓ Tous les médicaments disponibles ({pharmacy.medicationsFound}/{pharmacy.totalMedicationsSearched})
                            </span>
                          ) : (
                            <span className="text-orange-600 font-medium">
                              {pharmacy.medicationsFound}/{pharmacy.totalMedicationsSearched} médicaments disponibles
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
          </div>
        )}
      </main>

      {/* Modals */}
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

      {/* ============================================
          📱 SECTION TÉLÉCHARGEMENT APP
          ============================================ */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 md:py-24 bg-gradient-to-br from-emerald-50 via-white to-pink-50">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card p-8 sm:p-12 md:p-16 rounded-3xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-6">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Application Mobile</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Téléchargez <span className="gradient-text-emerald">PharmFinder</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 sm:mb-12">
              Accédez à PharmFinder depuis votre smartphone. Trouvez vos médicaments où que vous soyez, quand vous voulez.
            </p>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Google Play Button */}
              <a
                href="/downloads/pharmfinder-release.apk"
                download
                className="group inline-flex items-center gap-3 px-6 py-4 bg-black hover:bg-gray-900 text-white rounded-xl transition-all duration-300 apple-press w-full sm:w-auto"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs opacity-90">Disponible sur</div>
                  <div className="text-base font-semibold">Google Play</div>
                </div>
              </a>

              {/* App Store Button (Coming Soon) */}
              <button
                disabled
                className="group inline-flex items-center gap-3 px-6 py-4 bg-gray-100 text-gray-400 rounded-xl transition-all duration-300 w-full sm:w-auto cursor-not-allowed opacity-60"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs">Bientôt disponible</div>
                  <div className="text-base font-semibold">App Store</div>
                </div>
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 sm:mt-16">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Download className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">Installation Simple</h4>
                <p className="text-sm text-muted-foreground">Téléchargez et installez en un clic</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <LocateFixed className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">Hors Ligne</h4>
                <p className="text-sm text-muted-foreground">Accédez aux pharmacies favorites sans connexion</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">Ultra Rapide</h4>
                <p className="text-sm text-muted-foreground">Performances optimisées pour mobile</p>
              </div>
            </div>

            {/* Version info */}
            <p className="text-xs text-muted-foreground mt-8">
              Version 1.0.0 • Requiert Android 7.0 ou supérieur
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
          📄 FOOTER MODERNE & RESPONSIVE
          ============================================ */}
      <footer className="border-t border-border/50 mt-12 sm:mt-16 md:mt-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Pill className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground">PharmFinder</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Trouvez vos médicaments en quelques secondes au Gabon.
              </p>
            </div>

            {/* Links - Produit */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a></li>
                <li><Link to="/scan" className="hover:text-foreground transition-colors">Scanner</Link></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">Comment ça marche</a></li>
              </ul>
            </div>

            {/* Links - Entreprise */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">Témoignages</a></li>
                <li><Link to="/register-pharmacy" className="hover:text-foreground transition-colors">Pharmaciens</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Links - Légal */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">CGU</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              &copy; {new Date().getFullYear()} PharmFinder. Tous droits réservés.
            </p>
            <div className="flex gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/admin'} className="text-xs sm:text-sm">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Administration
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
