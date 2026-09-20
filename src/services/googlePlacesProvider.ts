import { PlacesProvider } from './interfaces';
import { LocationPoint, SafeStop } from '@/domain/journey.types';

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export class GooglePlacesProvider implements PlacesProvider {
  async autocomplete(query: string, context?: any): Promise<LocationPoint[]> {
    if (!MAPS_API_KEY) throw new Error("Maps API Key missing");
    
    // Using the newer Places API Text Search or Autocomplete
    const res = await fetch(`https://places.googleapis.com/v1/places:autocomplete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': MAPS_API_KEY
      },
      body: JSON.stringify({
        input: query,
        includeQueryPredictions: false
      })
    });

    if (!res.ok) throw new Error("Failed to fetch autocomplete");
    const data = await res.json();
    
    // We would map predictions to LocationPoints.
    // However, Autocomplete doesn't return lat/lng directly without placeDetails.
    // So this is a simplified stub returning Place IDs.
    return (data.suggestions || []).filter((s: any) => s.placePrediction).map((s: any) => ({
      placeId: s.placePrediction.placeId,
      name: s.placePrediction.text.text,
      lat: 0,
      lng: 0,
      source: 'places' as const
    }));
  }

  async getPlaceDetails(placeId: string): Promise<LocationPoint> {
    if (!MAPS_API_KEY) throw new Error("Maps API Key missing");

    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?fields=id,displayName,location,formattedAddress`, {
      headers: {
        'X-Goog-Api-Key': MAPS_API_KEY
      }
    });

    if (!res.ok) throw new Error("Failed to fetch place details");
    const data = await res.json();

    return {
      placeId: data.id,
      name: data.displayName?.text || 'Unknown Location',
      address: data.formattedAddress,
      lat: data.location.latitude,
      lng: data.location.longitude,
      source: 'places' as const
    };
  }

  async nearbySearch(center: {lat: number, lng: number}, types: string[], radius: number): Promise<SafeStop[]> {
    if (!MAPS_API_KEY) throw new Error("Maps API Key missing");

    const res = await fetch(`https://places.googleapis.com/v1/places:searchNearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.primaryType'
      },
      body: JSON.stringify({
        includedTypes: types,
        maxResultCount: 5,
        locationRestriction: {
          circle: {
            center: {
              latitude: center.lat,
              longitude: center.lng
            },
            radius: radius
          }
        }
      })
    });

    if (!res.ok) throw new Error("Failed to fetch nearby safe stops");
    const data = await res.json();

    return (data.places || []).map((p: any) => ({
      id: p.id,
      name: p.displayName?.text || 'Safe Stop',
      primaryType: p.primaryType || 'establishment',
      location: { lat: p.location.latitude, lng: p.location.longitude },
      distanceMeters: 0, // Would need to be calculated
      routeAlignedScore: 0,
      estimatedTravelTimeMinutes: 0,
      source: 'live' as const,
      reasons: ['Found nearby safe stop']
    }));
  }
}
