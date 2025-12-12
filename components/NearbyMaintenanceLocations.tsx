import React, { useState } from 'react';
import { MapPin, Loader, AlertCircle, Phone, Globe, Star, Navigation } from 'lucide-react';

interface MaintenanceLocation {
  id: string;
  displayName: string;
  formattedAddress: string;
  location: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  distance?: number;
}

interface Props {
  onLocationSelected?: (location: MaintenanceLocation) => void;
}

export const NearbyMaintenanceLocations: React.FC<Props> = ({ onLocationSelected }) => {
  const [locations, setLocations] = useState<MaintenanceLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const searchNearbyLocations = async () => {
    setLoading(true);
    setError(null);
    setLocations([]);

    try {
      // Get user's current location
      if (!navigator.geolocation) {
        throw new Error('Geolocalização não é suportada no seu navegador');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });

          // Call Google Maps Places API
          const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
          
          if (!apiKey) {
            throw new Error('Chave da API Google Maps não configurada');
          }

          const requestBody = {
            includedTypes: ['auto_repair_shop', 'gas_station', 'car_repair', 'car_wash'],
            maxResultCount: 10,
            locationRestriction: {
              circle: {
                center: {
                  latitude,
                  longitude,
                },
                radius: 5000.0, // 5km radius
              },
            },
          };

          const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.internationalPhoneNumber,places.websiteUri',
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            throw new Error(`Erro na API: ${response.statusText}`);
          }

          const data = await response.json();

          // Calculate distance for each location
          const locationsWithDistance = (data.places || []).map((place: any) => {
            const distance = calculateDistance(
              latitude,
              longitude,
              place.location.latitude,
              place.location.longitude
            );

            return {
              id: place.name,
              displayName: place.displayName?.text || 'Sem nome',
              formattedAddress: place.formattedAddress || 'Endereço não disponível',
              location: place.location,
              rating: place.rating,
              userRatingCount: place.userRatingCount,
              internationalPhoneNumber: place.internationalPhoneNumber,
              websiteUri: place.websiteUri,
              distance,
            };
          });

          // Sort by distance
          locationsWithDistance.sort((a: MaintenanceLocation, b: MaintenanceLocation) => (a.distance || 0) - (b.distance || 0));

          setLocations(locationsWithDistance);
        },
        (err) => {
          setError(`Erro ao obter localização: ${err.message}`);
          setLoading(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const openInMaps = (location: MaintenanceLocation) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.location.latitude},${location.location.longitude}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={18} className="text-blue-600" />
        <h3 className="font-bold text-gray-800">Locais de Manutenção Próximos</h3>
      </div>

      <button
        onClick={searchNearbyLocations}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2 mb-4"
      >
        {loading ? (
          <>
            <Loader size={18} className="animate-spin" />
            Buscando...
          </>
        ) : (
          <>
            <Navigation size={18} />
            Buscar Locais Próximos
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-700 font-bold text-sm">Erro</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {locations.length > 0 && (
        <div className="space-y-3">
          {locations.map((location) => (
            <div key={location.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">{location.displayName}</h4>
                  <p className="text-xs text-gray-600 mt-1">{location.formattedAddress}</p>
                </div>
                {location.distance && (
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold ml-2">
                    {location.distance.toFixed(1)} km
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-3">
                {location.rating && (
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-gray-700">
                      {location.rating.toFixed(1)} ({location.userRatingCount || 0})
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openInMaps(location)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  Ver no Mapa
                </button>
                {location.internationalPhoneNumber && (
                  <a
                    href={`tel:${location.internationalPhoneNumber}`}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Phone size={14} />
                    Ligar
                  </a>
                )}
                {location.websiteUri && (
                  <a
                    href={location.websiteUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Globe size={14} />
                    Site
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {locations.length === 0 && !loading && !error && (
        <p className="text-gray-500 text-sm text-center py-4">Clique no botão acima para buscar locais de manutenção próximos</p>
      )}
    </div>
  );
};
