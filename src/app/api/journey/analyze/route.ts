import { NextRequest, NextResponse } from 'next/server';
import { JourneyRequest, Journey, Route, JourneyTwinEvent } from '@/domain/journey.types';
import { GoogleMapsRoutingProvider } from '@/services/googleMapsRoutingProvider';
import { DemoRoutingProvider, DemoWeatherProvider, DemoPlacesProvider, DemoGeminiProvider } from '@/services/demoProviders';
import { TomorrowWeatherProvider } from '@/services/tomorrowWeatherProvider';
import { calculateRouteExposure } from '@/lib/exposure/exposureEngine';

export async function POST(req: NextRequest) {
  try {
    const { request, mode } = await req.json() as { request: JourneyRequest, mode: 'demo' | 'live' };

    const isDemo = mode === 'demo';

    const routingProvider = isDemo ? new DemoRoutingProvider() : new GoogleMapsRoutingProvider();
    const weatherProvider = isDemo ? new DemoWeatherProvider() : new TomorrowWeatherProvider();
    const geminiProvider = new DemoGeminiProvider(); // We'll keep Gemini as Demo stub for this specific endpoint until we move it to the real one, or we can use the real one if we want. Wait, let's use the real endpoint from our existing route.

    // 1. Compute Routes
    const baseRoutes = await routingProvider.computeRoutes(request);

    // 2. Augment with Weather & 3. Calculate Exposure
    const hydratedRoutes = await Promise.all(baseRoutes.map(async (route) => {
      // Sample multiple points along the route for weather
      const samplePoints: [number, number][] = [];
      const numSamples = Math.min(5, Math.max(2, Math.ceil(route.distanceMeters / 50000))); // Sample every ~50km, min 2, max 5
      for (let i = 0; i < numSamples; i++) {
        const idx = Math.floor((i / (numSamples - 1 || 1)) * (route.path.length - 1));
        samplePoints.push(route.path[idx] || route.path[0]);
      }
      
      // Fetch weather for sample points
      const forecasts = await Promise.all(
        samplePoints.map(p => weatherProvider.getForecast(p[0], p[1]))
      );
      
      // Create per-km weather segments
      const numSegments = Math.max(2, Math.ceil(route.distanceMeters / 1000));
      const segmentDistance = route.distanceMeters / numSegments;
      const segmentTime = route.durationSeconds / numSegments;
      const currentTimestamp = Date.now();
      const avgSpeedKmh = (route.distanceMeters / 1000) / (route.durationSeconds / 3600);

      const weatherSegments = Array.from({ length: numSegments }).map((_, i) => {
        // Pick the closest forecast point for this segment
        const forecastIdx = Math.min(forecasts.length - 1, Math.floor((i / numSegments) * forecasts.length));
        const forecast = forecasts[forecastIdx];
        const hourOffset = Math.floor((i * segmentTime) / 3600);
        const p = forecast.points ? forecast.points[hourOffset % forecast.points.length] : {
          temperatureC: 25, condition: 'CLEAR', precipitationProbability: 0, precipitationMm: 0, windKph: 10, visibilityKm: 10, humidity: 50, feelsLikeC: 27
        };
        
        // Calculate location for this km segment along the route
        const pathIdx = Math.min(route.path.length - 1, Math.floor((i / numSegments) * route.path.length));
        const segPoint = route.path[pathIdx] || route.path[0];
        
        return {
          routeId: route.id,
          segmentStartDistance: i * segmentDistance,
          segmentEndDistance: (i + 1) * segmentDistance,
          segmentStartTime: currentTimestamp + (i * segmentTime * 1000),
          segmentEndTime: currentTimestamp + ((i + 1) * segmentTime * 1000),
          location: { lat: segPoint[0], lng: segPoint[1] },
          condition: p.condition,
          precipitationProbability: p.precipitationProbability,
          precipitationMm: p.precipitationMm,
          intensity: p.precipitationMm > 7.5 ? 'heavy' as const : p.precipitationMm > 2.5 ? 'moderate' as const : p.precipitationMm > 0 ? 'light' as const : 'none' as const,
          temperatureC: p.temperatureC,
          feelsLikeC: p.feelsLikeC || p.temperatureC,
          humidity: p.humidity || 0,
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
      // Start event
      journeyTwin.push({
        id: `event-start`,
        timestamp: Date.now(),
        location: request.origin,
        condition: defaultRoute.weatherSegments[0]?.condition || 'CLEAR',
        visibilityKm: 10,
        exposureState: 'Departure',
        reason: 'Origin'
      });

      // Create waypoint events every ~50km
      const totalKm = defaultRoute.distanceMeters / 1000;
      const numWaypoints = Math.min(5, Math.max(1, Math.floor(totalKm / 50)));
      for (let i = 0; i < numWaypoints; i++) {
        const fraction = (i + 1) / (numWaypoints + 1);
        const segIdx = Math.min(defaultRoute.weatherSegments.length - 1, Math.floor(fraction * defaultRoute.weatherSegments.length));
        const ws = defaultRoute.weatherSegments[segIdx];
        journeyTwin.push({
          id: `event-waypoint-${i}`,
          timestamp: ws.segmentStartTime,
          location: ws.location,
          condition: ws.condition,
          visibilityKm: ws.visibilityKm,
          exposureState: ws.intensity,
          reason: 'En Route'
        });
      }

      // End event
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
