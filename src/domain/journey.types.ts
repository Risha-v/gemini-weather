export type TravelMode = 'TWO_WHEELER' | 'WALKING' | 'CYCLING' | 'DRIVING' | 'DELIVERY';
import { GeminiRecommendation } from './recommendation.types';
export type JourneyPreference = 'FASTEST' | 'BALANCED' | 'COMFORT' | 'CAUTIOUS';
export type DataSource = 'demo' | 'live' | 'fallback' | 'calculated';
export type HazardType = 'NONE' | 'FLOODING' | 'LOW_VISIBILITY' | 'EXTREME_HEAT' | 'STRONG_WIND' | 'SEVERE_RAIN';
export type WeatherCondition = 'CLEAR' | 'CLOUDY' | 'LIGHT_RAIN' | 'MODERATE_RAIN' | 'HEAVY_RAIN' | 'STORM' | 'FOG' | 'HOT';
export type JourneyState = 'IDLE' | 'ANALYZING' | 'ANALYZED' | 'NAVIGATING' | 'REFRESHING' | 'CONDITION_CHANGE_DETECTED' | 'REASSESSING' | 'EMERGENCY_MODE' | 'SAFE_STOP_SELECTED' | 'ERROR_RECOVERABLE';

export type ProviderSource = 'live' | 'demo' | 'fallback' | 'calculated';

export interface LocationPoint {
  placeId?: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  source: 'places' | 'geolocation' | 'manual' | 'demo';
}

export interface JourneyRequest {
  origin: LocationPoint;
  destination: LocationPoint;
  travelMode: TravelMode;
  preference: JourneyPreference;
  departureTime: number; // UTC timestamp or offset
}

export interface RoutePoint {
  lat: number;
  lng: number;
  cumulativeDistanceMeters: number;
  fractionOfRoute: number;
  segmentId?: string;
}

export interface WeatherSegment {
  routeId: string;
  segmentStartDistance: number;
  segmentEndDistance: number;
  segmentStartTime: number;
  segmentEndTime: number;
  location: { lat: number; lng: number };
  condition: WeatherCondition;
  precipitationProbability: number;
  precipitationMm: number;
  intensity: "none" | "light" | "moderate" | "heavy";
  temperatureC: number;
  windKph: number;
  visibilityKm: number;
  alertSeverity?: string;
  source: ProviderSource;
  forecastGeneratedAt: number;
}

export interface ExposureSummary {
  totalJourneyMinutes: number;
  expectedRainExposureMinutes: number;
  expectedHeavyRainExposureMinutes: number;
  expectedLowVisibilityMinutes: number;
  expectedStrongWindExposureMinutes: number;
  expectedHeatExposureMinutes: number;
  severeAlertExposureMinutes: number;
  combinedExposureScore: number;
  majorExposureWindows: string[];
  earliestMeaningfulWeatherEvent?: string;
}

export interface Route {
  id: string;
  providerRouteId?: string;
  label: string;
  routeLabels: string[];
  distanceMeters: number;
  durationSeconds: number;
  path: [number, number][]; // Or LatLng literal array
  legs?: any[]; // Route legs from Google Maps
  weatherSegments: WeatherSegment[];
  exposure: ExposureSummary;
  source: ProviderSource;
}

export interface SafeStop {
  id: string;
  name: string;
  primaryType: string;
  location: { lat: number, lng: number };
  distanceMeters: number;
  routeAlignedScore: number;
  estimatedTravelTimeMinutes: number;
  openingHours?: string;
  source: ProviderSource;
  reasons: string[];
}

export interface JourneyTwinEvent {
  id: string;
  timestamp: number;
  elapsedJourneyMinutes?: number;
  distanceFromOriginKm?: number;
  location: { lat: number, lng: number };
  condition: WeatherCondition;
  temperatureC?: number;
  precipitationMm?: number;
  visibilityKm?: number;
  exposureState: string;
  reason: string;
  routeSegmentId?: string;
}

export interface Journey {
  journeyId: string;
  createdAt: number;
  origin: LocationPoint;
  destination: LocationPoint;
  travelMode: TravelMode;
  preference: JourneyPreference;
  departureTime: number;
  routes: Route[];
  selectedRouteId: string | null;
  recommendation: GeminiRecommendation | null;
  journeyTwin: JourneyTwinEvent[];
  incidents: any[];
  safeStops: SafeStop[];
  freshness: {
    sourceFetchedAt: number;
    forecastValidFrom?: number;
    forecastValidTo?: number;
    staleAfter: number;
    sourceMode: string;
  };
  sourceMode: 'demo' | 'live' | 'hybrid';
  state: JourneyState;
}
