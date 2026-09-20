import { JourneyRequest, Route, LocationPoint, SafeStop, WeatherSegment } from '@/domain/journey.types';
import { GeminiRecommendation } from '@/domain/recommendation.types';

export interface RoutingProvider {
  computeRoutes(request: JourneyRequest): Promise<Route[]>;
  refreshRoutes(request: JourneyRequest): Promise<Route[]>;
}

export interface WeatherProvider {
  getForecast(lat: number, lng: number): Promise<any>;
}

export interface PlacesProvider {
  autocomplete(query: string, context?: any): Promise<any[]>;
  getPlaceDetails(placeId: string): Promise<LocationPoint>;
  nearbySearch(center: {lat: number, lng: number}, types: string[], radius: number): Promise<SafeStop[]>;
}

export interface IncidentProvider {
  getIncidents(routePath: [number, number][]): Promise<any[]>;
}

export interface GeminiProvider {
  generateStructuredRecommendation(evidence: any): Promise<GeminiRecommendation>;
}
