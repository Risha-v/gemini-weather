import { Journey, RouteExperience, WeatherCondition, TravelMode, SmartStop, DataSource } from '@/domain/journey.types';
import { WeatherPoint } from '@/domain/weather.types';
import { GeminiRecommendation } from '@/domain/recommendation.types';

export interface RoutingProvider {
  getRoutes(origin: string, destination: string, mode: TravelMode): Promise<RouteExperience[]>;
}

export interface WeatherProvider {
  getHourlyForecast(lat: number, lng: number): Promise<WeatherPoint[]>;
}

export interface PlacesProvider {
  findSmartStops(lat: number, lng: number, categories: string[]): Promise<SmartStop[]>;
}

export interface IncidentProvider {
  getIncidents(routePath: [number, number][]): Promise<any[]>;
}

export interface GeminiProvider {
  generateStructuredRecommendation(context: any): Promise<GeminiRecommendation>;
}
