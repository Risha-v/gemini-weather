import { NextRequest, NextResponse } from 'next/server';
import { JourneyRequest, Journey, Route, JourneyTwinEvent } from '@/domain/journey.types';
import { GoogleMapsRoutingProvider } from '@/services/googleMapsRoutingProvider';
import { DemoRoutingProvider, DemoWeatherProvider, DemoPlacesProvider, DemoGeminiProvider } from '@/services/demoProviders';
import { GoogleWeatherProvider } from '@/services/googleWeatherProvider';
import { calculateRouteExposure } from '@/lib/exposure/exposureEngine';

export async function POST(req: NextRequest) {
  try {
    const { request, mode } = await req.json() as { request: JourneyRequest, mode: 'demo' | 'live' };

    const isDemo = mode === 'demo';

    const routingProvider = isDemo ? new DemoRoutingProvider() : new GoogleMapsRoutingProvider();
    const weatherProvider = isDemo ? new DemoWeatherProvider() : new GoogleWeatherProvider();
    const geminiProvider = new DemoGeminiProvider(); // We'll keep Gemini as Demo stub for this specific endpoint until we move it to the real one, or we can use the real one if we want. Wait, let's use the real endpoint from our existing route.

    // 1. Compute Routes
    const baseRoutes = await routingProvider.computeRoutes(request);

    // 2. Augment with Weather & 3. Calculate Exposure
    const hydratedRoutes = await Promise.all(baseRoutes.map(async (route) => {
      // In a real implementation, we would sample points along `route.path` and call weatherProvider for each point.
      // For this prototype, we'll fetch a single forecast for the destination or midpoint as a proxy if it's a live call,
      // or just use the simulated response from the weatherProvider.
      
      const midpoint = route.path[Math.floor(route.path.length / 2)];
      const forecast = await weatherProvider.getForecast(midpoint[0], midpoint[1]);
      
      // Map forecast to WeatherSegments along the route distance
      // This is highly simplified for the prototype orchestration layer
      const numSegments = 2;
      const segmentDistance = route.distanceMeters / numSegments;
      const segmentTime = route.durationSeconds / numSegments;
      const currentTimestamp = Date.now();

      const weatherSegments = Array.from({ length: numSegments }).map((_, i) => {
        const p = forecast.points ? forecast.points[i % forecast.points.length] : {
            temperatureC: 25, condition: 'CLEAR', precipitationProbability: 0, precipitationMm: 0, windKph: 10, visibilityKm: 10
        };
        
        return {
          routeId: route.id,
          segmentStartDistance: i * segmentDistance,
          segmentEndDistance: (i + 1) * segmentDistance,
          segmentStartTime: currentTimestamp + (i * segmentTime * 1000),
          segmentEndTime: currentTimestamp + ((i + 1) * segmentTime * 1000),
          location: { lat: midpoint[0], lng: midpoint[1] },
          condition: p.condition,
          precipitationProbability: p.precipitationProbability,
          precipitationMm: p.precipitationMm,
          intensity: 'none' as const,
          temperatureC: p.temperatureC,
          windKph: p.windKph,
          visibilityKm: p.visibilityKm,
          source: isDemo ? 'demo' as const : 'live' as const,
          forecastGeneratedAt: currentTimestamp
        };
      });

      route.weatherSegments = weatherSegments;
      route.exposure = calculateRouteExposure(weatherSegments, route.durationSeconds / 60);
      
      return route;
    }));

    // 4. Generate Recommendation (We'll do this client side or via a separate API call to keep this fast, or do it here)
    // The existing UI calls `/api/journey/recommendation` separately, so we just return the journey here and let the UI fetch Gemini.

    // Generate Journey Twin for the selected route
    const defaultRoute = hydratedRoutes[0];
    const journeyTwin: JourneyTwinEvent[] = [];
    if (defaultRoute) {
      journeyTwin.push({
        id: `event-start`,
        timestamp: Date.now(),
        location: request.origin,
        condition: defaultRoute.weatherSegments[0]?.condition || 'CLEAR',
        visibilityKm: 10,
        exposureState: 'Departure',
        reason: 'Origin'
      });
      // Add midpoints
      defaultRoute.weatherSegments.forEach((ws, idx) => {
        journeyTwin.push({
          id: `event-mid-${idx}`,
          timestamp: ws.segmentStartTime,
          location: ws.location,
          condition: ws.condition,
          visibilityKm: ws.visibilityKm,
          exposureState: ws.intensity,
          reason: 'En Route'
        });
      });
      journeyTwin.push({
        id: `event-end`,
        timestamp: Date.now() + defaultRoute.durationSeconds * 1000,
        location: request.destination,
        condition: defaultRoute.weatherSegments[defaultRoute.weatherSegments.length - 1]?.condition || 'CLEAR',
        visibilityKm: 10,
        exposureState: 'Arrival',
        reason: 'Destination'
      });
    }

    const journey: Journey = {
      journeyId: `journey-${Date.now()}`,
      createdAt: Date.now(),
      origin: request.origin,
      destination: request.destination,
      travelMode: request.travelMode,
      preference: request.preference,
      departureTime: request.departureTime,
      routes: hydratedRoutes,
      selectedRouteId: defaultRoute?.id || null,
      recommendation: null, // Fetched async in UI
      journeyTwin: journeyTwin, // Dynamically generated
      incidents: [],
      safeStops: [], // Fetched on demand when emergency mode triggers
      freshness: {
        sourceFetchedAt: Date.now(),
        staleAfter: Date.now() + 5 * 60000,
        sourceMode: mode
      },
      sourceMode: mode,
      state: 'ANALYZED'
    };

    return NextResponse.json({ journey });
  } catch (error) {
    console.error('Analyze API Error:', error);
    return NextResponse.json({ error: 'Failed to analyze journey' }, { status: 500 });
  }
}
