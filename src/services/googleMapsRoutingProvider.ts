import { RoutingProvider } from './interfaces';
import { JourneyRequest, Route, ProviderSource, WeatherSegment, ExposureSummary } from '@/domain/journey.types';

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export class GoogleMapsRoutingProvider implements RoutingProvider {
  async computeRoutes(request: JourneyRequest): Promise<Route[]> {
    if (!MAPS_API_KEY) throw new Error("Maps API Key missing");

    // The new Routes API
    // https://routes.googleapis.com/directions/v2:computeRoutes
    const travelMode = request.travelMode === 'TWO_WHEELER' ? 'TWO_WHEELER' :
                       request.travelMode === 'WALKING' ? 'WALK' :
                       request.travelMode === 'CYCLING' ? 'BICYCLE' : 'DRIVE';

    const routingPreference = request.preference === 'FASTEST' ? 'TRAFFIC_AWARE' : 
                              request.preference === 'BALANCED' ? 'TRAFFIC_AWARE_OPTIMAL' : 'TRAFFIC_AWARE';

    const res = await fetch(`https://routes.googleapis.com/directions/v2:computeRoutes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs,routes.routeLabels'
      },
      body: JSON.stringify({
        origin: { location: { latLng: { latitude: request.origin.lat, longitude: request.origin.lng } } },
        destination: { location: { latLng: { latitude: request.destination.lat, longitude: request.destination.lng } } },
        travelMode: travelMode,
        routingPreference: routingPreference,
        computeAlternativeRoutes: true,
        languageCode: 'en-US',
        units: 'METRIC',
      })
    });

    if (!res.ok) {
      console.error("Routing error:", await res.text());
      throw new Error("Failed to fetch routes");
    }
    
    const data = await res.json();
    if (!data.routes || data.routes.length === 0) {
      return [];
    }

    const decodePolyline = (encoded: string): [number, number][] => {
      // Simplified polyline decode or just returning an empty array if we don't have a decoder handy
      // Normally we'd use a polyline library here.
      // For now, we will return the start and end as a stub, since we are building the orchestration layer.
      return [[request.origin.lat, request.origin.lng], [request.destination.lat, request.destination.lng]];
    };

    return data.routes.map((r: any, idx: number) => {
      // Convert duration "1800s" to seconds
      const durationSeconds = parseInt(r.duration?.replace('s', '') || '0', 10);
      
      const emptyExposure: ExposureSummary = {
        totalJourneyMinutes: Math.round(durationSeconds / 60),
        expectedRainExposureMinutes: 0,
        expectedHeavyRainExposureMinutes: 0,
        expectedLowVisibilityMinutes: 0,
        expectedStrongWindExposureMinutes: 0,
        expectedHeatExposureMinutes: 0,
        severeAlertExposureMinutes: 0,
        combinedExposureScore: 0,
        majorExposureWindows: []
      };

      return {
        id: `live-route-${idx}`,
        providerRouteId: r.routeToken,
        label: `Route ${String.fromCharCode(65 + idx)}`,
        routeLabels: r.routeLabels || [],
        distanceMeters: r.distanceMeters,
        durationSeconds: durationSeconds,
        path: decodePolyline(r.polyline?.encodedPolyline || ''),
        legs: r.legs,
        weatherSegments: [], // To be populated by WeatherProvider orchestration
        exposure: emptyExposure, // To be calculated after weather orchestration
        source: 'live' as ProviderSource
      };
    });
  }

  async refreshRoutes(request: JourneyRequest): Promise<Route[]> {
    // Same as compute routes for now
    return this.computeRoutes(request);
  }
}
