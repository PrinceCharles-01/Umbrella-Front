/**
 * Hook personnalisé pour gérer la géolocalisation avec persistance
 * Sauvegarde la localisation dans localStorage pour 24h
 */
import { useState, useEffect } from 'react';

interface GeolocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface UseGeolocationReturn {
  location: { lat: number; lon: number } | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
  clearLocation: () => void;
}

const STORAGE_KEY = 'umbrella_user_location';
const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger la localisation depuis localStorage au montage
  useEffect(() => {
    const loadSavedLocation = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data: GeolocationData = JSON.parse(saved);
          const now = Date.now();

          // Vérifier si la localisation n'a pas expiré
          if (now - data.timestamp < EXPIRATION_TIME) {
            setLocation({ lat: data.latitude, lon: data.longitude });
            console.log('📍 Localisation chargée depuis le cache');
            return true;
          } else {
            // Expirée, on supprime
            localStorage.removeItem(STORAGE_KEY);
            console.log('⏰ Localisation expirée, suppression');
          }
        }
      } catch (err) {
        console.error('Erreur chargement localisation:', err);
      }
      return false;
    };

    if (!loadSavedLocation()) {
      // Pas de localisation sauvegardée ou expirée, on demande automatiquement
      requestLocation();
    }
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        // Sauvegarder dans localStorage
        const dataToSave: GeolocationData = {
          latitude: newLocation.lat,
          longitude: newLocation.lon,
          timestamp: Date.now(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

        setLocation(newLocation);
        setLoading(false);
        console.log('✅ Localisation obtenue et sauvegardée');
      },
      (err) => {
        setError(
          err.code === 1
            ? 'Vous avez refusé l\'accès à votre position'
            : 'Impossible d\'obtenir votre position'
        );
        setLoading(false);
        console.error('❌ Erreur géolocalisation:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const clearLocation = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLocation(null);
    console.log('🗑️ Localisation supprimée');
  };

  return {
    location,
    loading,
    error,
    requestLocation,
    clearLocation,
  };
};
