import { Journey, Route, LocationPoint, SafeStop } from '../domain/journey.types';
import { GeminiRecommendation } from '../domain/recommendation.types';

const currentTimestamp = Date.now(); 

export const demoOrigin: LocationPoint = {
  name: 'Home',
  lat: 28.61,
  lng: 77.21,
  source: 'demo'
};

export const demoDestination: LocationPoint = {
  name: 'Office',
  lat: 28.62,
  lng: 77.23,
  source: 'demo'
};

export const demoRouteA: Route = {
  id: 'route-a',
  label: 'Route A',
  routeLabels: ['Fastest', 'High rain exposure'],
  distanceMeters: 8200,
  durationSeconds: 28 * 60,
  path: [
    [28.61, 77.21],
    [28.615, 77.22],
    [28.62, 77.23],
  ],
  weatherSegments: [
    {
      routeId: 'route-a',
      segmentStartDistance: 0,
      segmentEndDistance: 3000,
      segmentStartTime: currentTimestamp,
      segmentEndTime: currentTimestamp + 10 * 60000,
      location: { lat: 28.612, lng: 77.215 },
      condition: 'CLEAR',
      precipitationProbability: 10,
      precipitationMm: 0,
      intensity: 'none',
      temperatureC: 30,
      windKph: 10,
      visibilityKm: 10,
      source: 'demo',
      forecastGeneratedAt: currentTimestamp
    },
    {
      routeId: 'route-a',
      segmentStartDistance: 3000,
      segmentEndDistance: 8200,
      segmentStartTime: currentTimestamp + 10 * 60000,
      segmentEndTime: currentTimestamp + 28 * 60000,
      location: { lat: 28.618, lng: 77.225 },
      condition: 'HEAVY_RAIN',
      precipitationProbability: 95,
      precipitationMm: 20,
      intensity: 'heavy',
      temperatureC: 25,
      windKph: 15,
      visibilityKm: 2,
      source: 'demo',
      forecastGeneratedAt: currentTimestamp
    }
  ],
  exposure: {
    totalJourneyMinutes: 28,
    expectedRainExposureMinutes: 18,
    expectedHeavyRainExposureMinutes: 14,
    expectedLowVisibilityMinutes: 6,
    expectedStrongWindExposureMinutes: 0,
    expectedHeatExposureMinutes: 0,
    severeAlertExposureMinutes: 0,
    combinedExposureScore: 72,
    majorExposureWindows: ['Heavy rain expected between min 10 and 28'],
  },
  source: 'demo',
};

export const demoRouteB: Route = {
  id: 'route-b',
  label: 'Route B',
  routeLabels: ['+5 min', 'Avoids most heavy rain'],
  distanceMeters: 9000,
  durationSeconds: 33 * 60,
  path: [
    [28.61, 77.21],
    [28.60, 77.22],
    [28.62, 77.23],
  ],
  weatherSegments: [
    {
      routeId: 'route-b',
      segmentStartDistance: 0,
      segmentEndDistance: 5000,
      segmentStartTime: currentTimestamp,
      segmentEndTime: currentTimestamp + 15 * 60000,
      location: { lat: 28.605, lng: 77.215 },
      condition: 'CLEAR',
      precipitationProbability: 10,
      precipitationMm: 0,
      intensity: 'none',
      temperatureC: 30,
      windKph: 10,
      visibilityKm: 10,
      source: 'demo',
      forecastGeneratedAt: currentTimestamp
    },
    {
      routeId: 'route-b',
      segmentStartDistance: 5000,
      segmentEndDistance: 9000,
      segmentStartTime: currentTimestamp + 15 * 60000,
      segmentEndTime: currentTimestamp + 33 * 60000,
      location: { lat: 28.61, lng: 77.225 },
      condition: 'LIGHT_RAIN',
      precipitationProbability: 60,
      precipitationMm: 2,
      intensity: 'light',
      temperatureC: 28,
      windKph: 12,
      visibilityKm: 8,
      source: 'demo',
      forecastGeneratedAt: currentTimestamp
    }
  ],
  exposure: {
    totalJourneyMinutes: 33,
    expectedRainExposureMinutes: 18,
    expectedHeavyRainExposureMinutes: 3,
    expectedLowVisibilityMinutes: 2,
    expectedStrongWindExposureMinutes: 0,
    expectedHeatExposureMinutes: 0,
    severeAlertExposureMinutes: 0,
    combinedExposureScore: 31,
    majorExposureWindows: ['Light rain expected from min 15'],
  },
  source: 'demo',
};

export const demoGeminiRecommendation: GeminiRecommendation = {
  recommendedRouteId: 'route-b',
  headline: 'Route B Recommended',
  explanation: 'Route B reduces expected heavy-rain exposure with only a 5-minute travel-time increase.',
  reasons: ['+5 minutes travel time', '11 minutes lower expected heavy-rain exposure', 'Balanced preference'],
  userPreference: 'Balanced',
  evidenceReferences: ['route-a', 'route-b'],
  actions: ['Take Route B', 'Wait 10 min'],
  voiceSummary: 'Route B adds about 5 minutes but reduces expected heavy-rain exposure from roughly 14 minutes to 3 minutes. Want to take Route B?',
  confidenceLabel: 'high',
  uncertainty: 'Forecast conditions can change.',
  advisoryOnly: true,
  generatedAt: Date.now(),
};

export const demoSafeStop: SafeStop = {
  id: 'stop-1',
  name: 'City Mall Covered Parking',
  primaryType: 'parking',
  location: { lat: 28.615, lng: 77.220 },
  distanceMeters: 1300,
  routeAlignedScore: 90,
  estimatedTravelTimeMinutes: 4,
  source: 'demo',
  reasons: ['Covered stop before predicted heavy rain zone']
};

export const demoJourney: Journey = {
  journeyId: 'demo-journey-1',
  createdAt: currentTimestamp,
  origin: demoOrigin,
  destination: demoDestination,
  travelMode: 'TWO_WHEELER',
  preference: 'BALANCED',
  departureTime: currentTimestamp,
  routes: [demoRouteA, demoRouteB],
  selectedRouteId: 'route-b',
  recommendation: demoGeminiRecommendation,
  journeyTwin: [
    {
      id: 'event-1',
      timestamp: currentTimestamp,
      location: demoOrigin,
      condition: 'CLEAR',
      visibilityKm: 10,
      exposureState: 'Clear',
      reason: 'Departure'
    },
    {
      id: 'event-2',
      timestamp: currentTimestamp + 10 * 60000,
      location: { lat: 28.612, lng: 77.215 },
      condition: 'LIGHT_RAIN',
      visibilityKm: 8,
      exposureState: 'Light Rain',
      reason: 'En Route'
    },
    {
      id: 'event-3',
      timestamp: currentTimestamp + 20 * 60000,
      location: { lat: 28.618, lng: 77.225 },
      condition: 'HEAVY_RAIN',
      visibilityKm: 2,
      exposureState: 'Heavy Rain',
      reason: 'High Exposure Zone'
    },
    {
      id: 'event-4',
      timestamp: currentTimestamp + 28 * 60000,
      location: demoDestination,
      condition: 'HEAVY_RAIN',
      visibilityKm: 2,
      exposureState: 'Heavy Rain',
      reason: 'Arrival'
    }
  ],
  incidents: [],
  safeStops: [demoSafeStop],
  freshness: {
    sourceFetchedAt: currentTimestamp,
    staleAfter: currentTimestamp + 5 * 60000,
    sourceMode: 'demo'
  },
  sourceMode: 'demo',
  state: 'ANALYZED'
};
