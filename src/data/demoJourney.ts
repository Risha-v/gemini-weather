import { Journey, RouteExperience } from '../domain/journey.types';
import { GeminiRecommendation } from '../domain/recommendation.types';

const currentTimestamp = new Date().setHours(16, 0, 0, 0); // 4:00 PM today

export const demoRouteA: RouteExperience = {
  id: 'route-a',
  label: 'Route A',
  durationMinutes: 30,
  distanceKm: 12,
  path: [
    [25.6000, 85.1000],
    [25.6100, 85.1200],
    [25.6200, 85.1400],
  ],
  segments: [
    {
      id: 'a-1',
      path: [[25.6000, 85.1000], [25.6100, 85.1200]],
      startMinute: 0,
      endMinute: 10,
      weather: 'CLEAR',
      hazard: 'NONE',
      arrivalTime: currentTimestamp + 0 * 60000,
      exposureLevel: 'LOW',
    },
    {
      id: 'a-2',
      path: [[25.6100, 85.1200], [25.6200, 85.1400]],
      startMinute: 10,
      endMinute: 30,
      weather: 'HEAVY_RAIN',
      hazard: 'SEVERE_RAIN',
      arrivalTime: currentTimestamp + 10 * 60000,
      exposureLevel: 'HIGH',
    },
  ],
  exposure: {
    rainMinutes: 21,
    heavyRainMinutes: 21,
    heatMinutes: 0,
    windMinutes: 0,
    lowVisibilityMinutes: 5,
    waterloggingRisk: 'High',
    overallExposureDescription: 'High weather impact',
  },
  arrivalCondition: 'Heavy rain',
  tradeoffs: ['Fastest route', 'High rain exposure'],
  source: 'DEMO',
};

export const demoRouteB: RouteExperience = {
  id: 'route-b',
  label: 'Route B',
  durationMinutes: 35,
  distanceKm: 14,
  path: [
    [25.6000, 85.1000],
    [25.5900, 85.1200],
    [25.6200, 85.1400],
  ],
  segments: [
    {
      id: 'b-1',
      path: [[25.6000, 85.1000], [25.5900, 85.1200]],
      startMinute: 0,
      endMinute: 15,
      weather: 'CLEAR',
      hazard: 'NONE',
      arrivalTime: currentTimestamp + 0 * 60000,
      exposureLevel: 'LOW',
    },
    {
      id: 'b-2',
      path: [[25.5900, 85.1200], [25.6200, 85.1400]],
      startMinute: 15,
      endMinute: 35,
      weather: 'LIGHT_RAIN',
      hazard: 'NONE',
      arrivalTime: currentTimestamp + 15 * 60000,
      exposureLevel: 'LOW',
    },
  ],
  exposure: {
    rainMinutes: 20,
    heavyRainMinutes: 4,
    heatMinutes: 0,
    windMinutes: 0,
    lowVisibilityMinutes: 0,
    waterloggingRisk: 'Low',
    overallExposureDescription: 'Lower weather impact',
  },
  arrivalCondition: 'Clear',
  tradeoffs: ['+5 min', 'Avoids most heavy rain'],
  source: 'DEMO',
};

export const demoJourney: Journey = {
  id: 'demo-journey-1',
  origin: 'Home',
  destination: 'Office',
  mode: 'TWO_WHEELER',
  preference: 'BALANCED',
  departureTime: currentTimestamp,
  routes: [demoRouteA, demoRouteB],
  selectedRouteId: 'route-b',
  alerts: [],
  smartStops: [
    {
      id: 'stop-1',
      name: 'City Mall Covered Parking',
      category: 'Covered parking',
      distanceKm: 1.3,
      etaMinutes: 4,
      covered: true,
      coordinates: [25.6050, 85.1100],
      reason: 'Covered stop before predicted heavy rain zone'
    }
  ],
  currentState: 'ANALYZED',
  dataMode: 'DEMO',
  updatedAt: Date.now(),
};

export const demoGeminiRecommendation: GeminiRecommendation = {
  summary: 'Route B reduces expected heavy-rain exposure with only a 5-minute travel-time increase.',
  recommendation: 'Take Route B',
  reasonCodes: ['lower_rain_exposure', 'only_5_minutes_longer'],
  tradeoffs: ['adds_5_minutes'],
  uncertainty: 'Forecast conditions can change.',
  actions: ['Take Route B', 'Wait 10 min', 'Keep Route A'],
  voiceSummary: 'You can leave now, but the current route reaches the heavy-rain zone in about 18 minutes. Route B adds about 5 minutes and reduces expected heavy-rain exposure from roughly 21 minutes to 4 minutes. Want to take Route B?',
  confidenceLabel: 'High',
  generatedAt: Date.now(),
};
