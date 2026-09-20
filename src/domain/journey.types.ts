export type TravelMode = 'TWO_WHEELER' | 'WALKING' | 'CYCLING' | 'DRIVING' | 'DELIVERY' | 'LONG_TRIP';
export type JourneyPreference = 'FASTEST' | 'BALANCED' | 'COMFORT' | 'CAUTIOUS';
export type DataSource = 'DEMO' | 'MAPS' | 'WEATHER' | 'INCIDENT' | 'GEMINI' | 'USER';
export type HazardType = 'NONE' | 'FLOODING' | 'LOW_VISIBILITY' | 'EXTREME_HEAT' | 'STRONG_WIND' | 'SEVERE_RAIN';
export type WeatherCondition = 'CLEAR' | 'CLOUDY' | 'LIGHT_RAIN' | 'MODERATE_RAIN' | 'HEAVY_RAIN' | 'STORM' | 'FOG' | 'HOT';

export interface RouteSegment {
  id: string;
  path: [number, number][];
  startMinute: number;
  endMinute: number;
  weather: WeatherCondition;
  hazard: HazardType;
  incident?: string;
  arrivalTime: number;
  exposureLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ExposureSummary {
  rainMinutes: number;
  heavyRainMinutes: number;
  heatMinutes: number;
  windMinutes: number;
  lowVisibilityMinutes: number;
  waterloggingRisk: string;
  overallExposureDescription: string;
}

export interface RouteExperience {
  id: string;
  label: string;
  durationMinutes: number;
  distanceKm: number;
  path: [number, number][];
  segments: RouteSegment[];
  exposure: ExposureSummary;
  arrivalCondition: string;
  tradeoffs: string[];
  source: DataSource;
}

export type JourneyState = 'IDLE' | 'ANALYZING' | 'ANALYZED' | 'COMPARING' | 'WAITING_SIMULATION' | 'NAVIGATING' | 'CONDITIONS_CHANGED' | 'EMERGENCY' | 'SAFE_STOP_SELECTED' | 'DELIVERY_MODE' | 'ERROR_WITH_FALLBACK';

export interface SmartStop {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  etaMinutes: number;
  covered: boolean;
  coordinates: [number, number];
  reason?: string;
}

export interface Journey {
  id: string;
  origin: string;
  destination: string;
  mode: TravelMode;
  preference: JourneyPreference;
  departureTime: number;
  routes: RouteExperience[];
  selectedRouteId: string | null;
  alerts: any[];
  smartStops: SmartStop[];
  currentState: JourneyState;
  dataMode: DataSource;
  updatedAt: number;
}
