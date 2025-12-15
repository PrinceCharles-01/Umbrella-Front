import { CartItem } from "@/types";
import { buildApiUrl, API_ENDPOINTS, ERROR_MESSAGES, API_CONFIG } from "@/config/api.config";

// Export pour compatibilité avec le code existant
export const API_BASE_URL = API_CONFIG.BASE_URL;

//#################################################################################
// TYPES
//#################################################################################

export interface ApiMedication {
  id: number;
  nom: string;
  description: string | null;
  dosage: string | null;
  categorie: string | null;
  prix: number; // In cents
  min_stock: number;
}

export interface ApiPharmacy {
  id: number;
  nom: string;
  adresse: string;
  telephone: string | null;
  latitude: string;
  longitude: string;
  note: string;
  opening_time: string | null;
  closing_time: string | null;
  // Fields from annotation
  distance_km?: number;
  is_open?: boolean;
  medication_price?: number; // in cents
  medication_stock?: number;
  match_count?: number;
  total_meds_in_search?: number;
  assurances_acceptees: string[] | string | null;
  assurance_speciale: string | null;
}

//#################################################################################
// API FUNCTIONS
//#################################################################################

/**
 * Fetches all medications from the backend.
 */
export const getMedications = async (): Promise<ApiMedication[]> => {
  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.MEDICATIONS));

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }
      if (response.status >= 500) {
        throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      }
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }

    const data = await response.json();

    // Handle paginated response from Django REST Framework
    if (data && typeof data === 'object' && 'results' in data) {
      return data.results;
    }

    // Handle direct array response (fallback)
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    throw error;
  }
};

/**
 * Fetches a single medication by its ID.
 */
export const getMedicationById = async (id: number): Promise<ApiMedication> => {
  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.MEDICATION_BY_ID(id)));

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Médicament non trouvé');
      }
      if (response.status >= 500) {
        throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      }
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    throw error;
  }
};

/**
 * Fetches pharmacies based on a single medication and user location.
 */
export const getPharmacies = async ({ lat, lon, medicationId }: { lat?: number; lon?: number; medicationId: number }): Promise<ApiPharmacy[]> => {
  try {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat.toString());
    if (lon) params.append('lon', lon.toString());
    if (medicationId) params.append('medication_id', medicationId.toString());

    const url = `${buildApiUrl(API_ENDPOINTS.PHARMACIES)}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Aucune pharmacie trouvée pour ce médicament');
      }
      if (response.status >= 500) {
        throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      }
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }

    const data = await response.json();

    // Handle paginated response from Django REST Framework
    if (data && typeof data === 'object' && 'results' in data) {
      return data.results;
    }

    // Handle direct array response (fallback)
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    throw error;
  }
};

/**
 * Finds pharmacies that have a list of medications.
 */
export const findPharmaciesByMedications = async (medicationIds: number[]): Promise<ApiPharmacy[]> => {
  try {
    if (!medicationIds || medicationIds.length === 0) {
      throw new Error('Veuillez sélectionner au moins un médicament');
    }

    const response = await fetch(buildApiUrl(API_ENDPOINTS.FIND_BY_MEDICATIONS), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ medication_ids: medicationIds }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Aucune pharmacie ne possède ces médicaments');
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.error || ERROR_MESSAGES.BAD_REQUEST);
      }
      if (response.status >= 500) {
        throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      }
      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    throw error;
  }
};

/**
 * Finds pharmacies that have a specific list of medication IDs.
 * This is an alias for findPharmaciesByMedications for backward compatibility.
 */
export const findPharmaciesByMedicationIds = async (medicationIds: number[]): Promise<ApiPharmacy[]> => {
  return findPharmaciesByMedications(medicationIds);
};

/**
 * Creates a new pharmacy.
 */
export const createPharmacy = async (pharmacyData: {
  nom: string;
  adresse: string;
  telephone?: string;
  opening_time?: string;
  closing_time?: string;
  assurances_acceptees?: string;
}): Promise<ApiPharmacy> => {
  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.PHARMACIES), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...pharmacyData,
        // Convert comma-separated string to array if needed by the backend
        assurances_acceptees: pharmacyData.assurances_acceptees?.split(',').map(s => s.trim()).filter(s => s) || [],
      }),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Données de pharmacie invalides');
      }
      if (response.status >= 500) {
        throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      }
      throw new Error('Impossible de créer la pharmacie');
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    throw error;
  }
};

interface OrderPayload {
  pharmacy: number;
  items: {
    medication: number;
    quantity: number;
    price_at_order: string;
  }[];
}

/**
 * Creates a new order.
 * @param cartItems - The items in the cart.
 */
export const createOrder = async (cartItems: CartItem[]): Promise<any> => {
  try {
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Votre panier est vide");
    }

    const payload: OrderPayload = {
      pharmacy: cartItems[0].pharmacyId,
      items: cartItems.map(item => ({
        medication: item.medicationId,
        quantity: item.quantity,
        price_at_order: item.price,
      })),
    };

    const response = await fetch(buildApiUrl(API_ENDPOINTS.ORDERS), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Commande invalide. Vérifiez votre panier.');
      }
      if (response.status === 404) {
        throw new Error('Pharmacie ou médicament introuvable');
      }
      if (response.status >= 500) {
        throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      }
      throw new Error('Impossible de créer la commande');
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    throw error;
  }
};