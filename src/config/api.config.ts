/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// Détection automatique de l'environnement
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Configuration de base
export const API_CONFIG = {
  // URL de base de l'API (peut être surchargée par VITE_API_URL dans .env)
  BASE_URL: import.meta.env.VITE_API_URL ||
            (isDevelopment ? 'http://127.0.0.1:3001/api' : '/api'),

  // Timeout pour les requêtes (en millisecondes)
  TIMEOUT: 30000, // 30 secondes

  // Nombre de tentatives en cas d'échec
  RETRY_ATTEMPTS: 3,

  // Délai entre les tentatives (en millisecondes)
  RETRY_DELAY: 1000, // 1 seconde

  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Médicaments
  MEDICATIONS: '/medications/',
  MEDICATION_BY_ID: (id: number) => `/medications/${id}/`,

  // Pharmacies
  PHARMACIES: '/pharmacies/',
  PHARMACY_BY_ID: (id: number) => `/pharmacies/${id}/`,
  PHARMACY_STOCKS: (id: number) => `/pharmacies/${id}/stocks/`,
  PHARMACY_ROUTE: (id: number) => `/pharmacies/${id}/route/`,
  FIND_BY_MEDICATIONS: '/pharmacies/find-by-medications/',

  // Commandes
  ORDERS: '/orders/',
  ORDER_BY_ID: (id: number) => `/orders/${id}/`,

  // Pharmacy-Medications
  PHARMACY_MEDICATIONS: '/pharmacy-medications/',

  // Scan d'ordonnance
  SCAN_PRESCRIPTION: '/scan-prescription/',
};

// Configuration de la pagination
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
  SERVER_ERROR: 'Le serveur ne répond pas. Veuillez réessayer plus tard.',
  TIMEOUT_ERROR: 'La requête a pris trop de temps. Veuillez réessayer.',
  NOT_FOUND: 'Ressource introuvable.',
  UNAUTHORIZED: 'Accès non autorisé.',
  FORBIDDEN: 'Action interdite.',
  BAD_REQUEST: 'Requête invalide.',
  UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.',
};

// Helper pour construire une URL complète
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/')
    ? API_CONFIG.BASE_URL.slice(0, -1)
    : API_CONFIG.BASE_URL;

  const path = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  return `${baseUrl}${path}`;
};

// Helper pour ajouter des paramètres de pagination
export const addPaginationParams = (
  url: string,
  page?: number,
  pageSize?: number
): string => {
  const urlObj = new URL(url, window.location.origin);

  if (page !== undefined) {
    urlObj.searchParams.set('page', page.toString());
  }

  if (pageSize !== undefined) {
    urlObj.searchParams.set('page_size', pageSize.toString());
  }

  return urlObj.toString().replace(window.location.origin, '');
};

export default API_CONFIG;
