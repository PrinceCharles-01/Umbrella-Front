import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Building2, 
  Pill, 
  Package, 
  MapPin, 
  Phone, 
  Clock,
  Search,
  AlertCircle,
  CheckCircle2,
  Star,
  RefreshCw,
  Home
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import AdminEditModal from "./AdminEditModal";
import { Link } from "react-router-dom";

const toast = {
  success: (message) => console.log("Success:", message),
  error: (message) => console.error("Error:", message)
};

const isPharmacyOpen = (openingTime, closingTime) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [openHour, openMin] = openingTime.split(':').map(Number);
  const [closeHour, closeMin] = closingTime.split(':').map(Number);
  
  const openingMinutes = openHour * 60 + openMin;
  const closingMinutes = closeHour * 60 + closeMin;
  
  return currentTime >= openingMinutes && currentTime <= closingMinutes;
};

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("pharmacies");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingItemType, setEditingItemType] = useState("");

  const [pharmacies, setPharmacies] = useState([]);
  const [medications, setMedications] = useState([]);
  const [pharmacyMedications, setPharmacyMedications] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      // Set loading state for initial load or full refresh
      if (!isRefreshing) setIsLoading(true);

      // Fetch pharmacies and medications in parallel
      const [pharmaciesResponse, medicationsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/pharmacies/`),
        fetch(`${API_BASE_URL}/medications/`)
      ]);

      if (!pharmaciesResponse.ok) throw new Error("Failed to fetch pharmacies");
      if (!medicationsResponse.ok) throw new Error("Failed to fetch medications");

      const pharmaciesData = await pharmaciesResponse.json();
      const medicationsData = await medicationsResponse.json();

      // Handle Django pagination format { results: [...] } vs direct array [...]
      const pharmaciesArray = Array.isArray(pharmaciesData) ? pharmaciesData : pharmaciesData.results || [];
      const medicationsArray = Array.isArray(medicationsData) ? medicationsData : medicationsData.results || [];

      setPharmacies(pharmaciesArray);
      setMedications(medicationsArray);

      // Now, fetch stocks for each pharmacy
      const stockPromises = pharmaciesArray.map(pharmacy =>
        fetch(`${API_BASE_URL}/pharmacies/${pharmacy.id}/stocks/`).then(res => {
          if (!res.ok) {
            console.error(`Failed to fetch stock for pharmacy ${pharmacy.id}`);
            return { pharmacyId: pharmacy.id, stocks: [] }; // Return empty on error
          }
          return res.json().then(stocks => ({ pharmacyId: pharmacy.id, stocks }));
        })
      );

      const stocksByPharmacy = await Promise.all(stockPromises);

      const stocksMap = stocksByPharmacy.reduce((acc, { pharmacyId, stocks }) => {
        acc[pharmacyId] = stocks;
        return acc;
      }, {});

      setPharmacyMedications(stocksMap);
      setError(null);
      toast.success("Données actualisées");
    } catch (err) {
      const errorMessage = err.message || "Unknown error";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isRefreshing]); // Dependency on isRefreshing to control loading state

  useEffect(() => {
    fetchAllData();
  }, []); // Run only once on mount

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAllData();
  };

  const categories = Array.from(new Set(medications.map(med => med.categorie)));

  const filteredPharmacies = pharmacies.filter(pharmacy =>
    pharmacy.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pharmacy.adresse.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMedications = medications.filter(medication => {
    const matchesSearch = medication.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         medication.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || medication.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEditPharmacy = (pharmacy) => {
    setEditingItemType("pharmacy");
    setEditingItem(pharmacy || { 
      id: null, 
      nom: "", 
      adresse: "", 
      telephone: "", 
      opening_time: "09:00:00", 
      closing_time: "18:00:00", 
      latitude: "0.0", 
      longitude: "0.0", 
      note: "0.0", 
      assurances_acceptees: [], 
      assurance_speciale: null 
    });
    setIsEditing(true);
  };

  const handleEditMedication = (medication) => {
    setEditingItemType("medication");
    setEditingItem(medication || { 
      id: null, 
      nom: "", 
      description: "", 
      dosage: "", 
      categorie: "", 
      prix: 0, 
      min_stock: 0 
    });
    setIsEditing(true);
  };

  const handleSavePharmacy = async (updatedPharmacy) => {
    try {
      const method = updatedPharmacy.id === null ? "POST" : "PUT";
      const url = updatedPharmacy.id === null ? `${API_BASE_URL}/pharmacies/` : `${API_BASE_URL}/pharmacies/${updatedPharmacy.id}/`;
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPharmacy),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to save pharmacy");
      }

      toast.success("Pharmacie enregistrée avec succès");
      setIsEditing(false);
      setEditingItem(null);
      setEditingItemType("");
      fetchPharmacies();
    } catch (err) {
      const errorMessage = err.message || "Unknown error";
      toast.error(errorMessage);
    }
  };

  const handleSaveMedication = async (updatedMedication) => {
    try {
      const method = updatedMedication.id === null ? "POST" : "PUT";
      const url = updatedMedication.id === null ? `${API_BASE_URL}/medications/` : `${API_BASE_URL}/medications/${updatedMedication.id}/`;
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedMedication),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to save medication");
      }

      toast.success("Médicament enregistré avec succès");
      setIsEditing(false);
      setEditingItem(null);
      setEditingItemType("");
      fetchMedications();
    } catch (err) {
      const errorMessage = err.message || "Unknown error";
      toast.error(errorMessage);
    }
  };

  const handleDeletePharmacy = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette pharmacie ?")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/pharmacies/${id}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete pharmacy");
      }

      toast.success("Pharmacie supprimée avec succès");
      fetchPharmacies();
    } catch (err) {
      const errorMessage = err.message || "Unknown error";
      toast.error(errorMessage);
    }
  };

  const handleDeleteMedication = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce médicament ?")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/medications/${id}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete medication");
      }

      toast.success("Médicament supprimé avec succès");
      fetchMedications();
    } catch (err) {
      const errorMessage = err.message || "Unknown error";
      toast.error(errorMessage);
    }
  };

  const handleAddStock = async (pharmacyId, medicationId, quantity) => {
    const stocksForPharmacy = pharmacyMedications[pharmacyId] || [];
    const existingPharmacyMedication = stocksForPharmacy.find(
      (pm) => pm.medication === medicationId
    );

    try {
      let response;
      if (existingPharmacyMedication) {
        const url = `${API_BASE_URL}/pharmacy-medications/${existingPharmacyMedication.id}/`;
        const body = {
          // Send all fields required by the serializer for a PUT request
          pharmacy: pharmacyId,
          medication: medicationId,
          stock: existingPharmacyMedication.stock + quantity,
          pharmacy_medication_price: existingPharmacyMedication.pharmacy_medication_price,
        };
        response = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        const url = `${API_BASE_URL}/pharmacy-medications/`;
        const medication = medications.find(m => m.id === medicationId);
        const body = {
          pharmacy: pharmacyId,
          medication: medicationId,
          stock: quantity,
          pharmacy_medication_price: medication ? medication.prix : 0,
        };
        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update stock");
      }

      // Refetch just the stocks for the updated pharmacy
      const updatedStocksResponse = await fetch(`${API_BASE_URL}/pharmacies/${pharmacyId}/stocks/`);
      const updatedStocks = await updatedStocksResponse.json();

      setPharmacyMedications(prev => ({
        ...prev,
        [pharmacyId]: updatedStocks,
      }));

      toast.success(`Stock mis à jour: +${quantity} unités`);
    } catch (err) {
      const errorMessage = err.message || "Unknown error";
      toast.error(errorMessage);
    }
  };

  const handleAddNew = () => {
    if (activeTab === "pharmacies") {
      handleEditPharmacy(undefined);
    } else if (activeTab === "medications") {
      handleEditMedication(undefined);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="sticky top-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Administration PharmFinder</h1>
              <p className="text-sm text-gray-600">Gestion des pharmacies et médicaments</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>Accueil</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Actualisation...' : 'Actualiser'}</span>
            </Button>
            <Badge className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Système actif
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Erreur: {error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-100">
                  <Building2 className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{pharmacies.length}</div>
                  <div className="text-sm text-gray-600">Pharmacies actives</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-pink-100">
                  <Pill className="h-6 w-6 text-pink-700" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{medications.length}</div>
                  <div className="text-sm text-gray-600">Médicaments référencés</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-100">
                  <Package className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.values(pharmacyMedications).flat().reduce((sum, pm) => sum + (Number(pm.stock) || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Unités en stock</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-yellow-100">
                  <AlertCircle className="h-6 w-6 text-yellow-700" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {medications.filter(med => {
                      const totalStock = Object.values(pharmacyMedications)
                        .flat()
                        .filter(pm => pm.medication === med.id)
                        .reduce((sum, pm) => sum + (Number(pm.stock) || 0), 0);
                      return totalStock <= med.min_stock;
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">Alertes stock bas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/70 backdrop-blur p-1 h-auto">
            <TabsTrigger value="pharmacies" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Pharmacies
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Médicaments
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Gestion Stock
            </TabsTrigger>
          </TabsList>

          <div className="bg-white/70 backdrop-blur p-6 rounded-xl border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {activeTab === "medications" && (
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>

          <TabsContent value="pharmacies" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : filteredPharmacies.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Aucune pharmacie trouvée</div>
            ) : (
              <div className="grid gap-6">
                {filteredPharmacies.map((pharmacy) => (
                  <Card key={pharmacy.id} className="bg-white/70 backdrop-blur border border-gray-200 hover:border-gray-300 transition-colors">
                    <CardHeader className="pb-4 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg text-gray-900">{pharmacy.nom}</CardTitle>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{(parseFloat(pharmacy.note) || 0).toFixed(1)}</span>
                            </div>
                            {isPharmacyOpen(pharmacy.opening_time, pharmacy.closing_time) ? (
                              <Badge className="bg-green-50 text-green-700 border-green-200">Ouverte</Badge>
                            ) : (
                              <Badge className="bg-red-50 text-red-700 border-red-200">Fermée</Badge>
                            )}
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                {pharmacy.adresse}
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-blue-600" />
                                {pharmacy.telephone}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-600" />
                                {pharmacy.opening_time} - {pharmacy.closing_time}
                              </div>
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-blue-600" />
                                { (pharmacyMedications[pharmacy.id] || []).length} médicaments
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditPharmacy(pharmacy)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeletePharmacy(pharmacy.id)}
                            className="hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-2">Assurances acceptées</div>
                          <div className="flex flex-wrap gap-2">
                            {pharmacy.assurances_acceptees.map((insurance) => (
                              <Badge key={insurance} variant="outline" className="text-xs">
                                {insurance}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {pharmacy.assurance_speciale && (
                          <div>
                            <div className="text-sm font-medium text-gray-900 mb-2">Particularité</div>
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                              {pharmacy.assurance_speciale}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="medications" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : filteredMedications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Aucun médicament trouvé</div>
            ) : (
              <div className="grid gap-6">
                {filteredMedications.map((medication) => {
                  const totalStock = Object.values(pharmacyMedications)
                    .flat()
                    .filter(pm => pm.medication === medication.id)
                    .reduce((sum, pm) => sum + (Number(pm.stock) || 0), 0);
                  
                  return (
                    <Card key={medication.id} className="bg-white/70 backdrop-blur border border-gray-200 hover:border-gray-300 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{medication.nom}</h3>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {medication.categorie}
                              </Badge>
                              {totalStock <= medication.min_stock && (
                                <Badge className="bg-red-50 text-red-700 border-red-200">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Stock bas
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{medication.description}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditMedication(medication)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteMedication(medication.id)}
                              className="hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600 mb-1">Prix</div>
                            <div className="font-semibold text-gray-900">{(Number(medication.prix) || 0) / 100} FCFA</div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">Stock total</div>
                            <div className="font-semibold text-gray-900">
                              {totalStock} unités
                              <span className="text-xs text-gray-500 ml-2">
                                (Min: {medication.min_stock})
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">Dosage</div>
                            <div className="font-semibold text-gray-900">{medication.dosage}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stock" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Chargement...</div>
            ) : (
              <div className="grid gap-6">
                {pharmacies.map((pharmacy) => {
                  const pharmacyMeds = pharmacyMedications[pharmacy.id] || [];
                  
                  return (
                    <Card key={pharmacy.id} className="bg-white/70 backdrop-blur border border-gray-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          {pharmacy.nom}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {pharmacyMeds.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">Aucun médicament en stock</p>
                        ) : (
                          <div className="space-y-4">
                            {pharmacyMeds.map((pharmacyMed) => {
                              const medication = medications.find(m => m.id === pharmacyMed.medication);
                              if (!medication) return null;
                              
                              return (
                                <div key={pharmacyMed.id} className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{medication.nom}</div>
                                    <div className="text-sm text-gray-600">
                                      Stock: {pharmacyMed.stock} unités • Prix: {(Number(pharmacyMed.pharmacy_medication_price) || 0) / 100} FCFA
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleAddStock(pharmacy.id, pharmacyMed.medication, 10)}
                                    >
                                      +10
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleAddStock(pharmacy.id, pharmacyMed.medication, 50)}
                                    >
                                      +50
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {isEditing && (
        <AdminEditModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          item={editingItem}
          itemType={editingItemType as "pharmacy" | "medication"}
          onSave={editingItemType === 'pharmacy' ? handleSavePharmacy : handleSaveMedication}
          allMedicationCategories={categories}
        />
      )}
    </div>
  );
};

export default AdminPanel;