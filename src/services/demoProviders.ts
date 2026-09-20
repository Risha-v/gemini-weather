import { RoutingProvider, WeatherProvider, PlacesProvider, GeminiProvider } from './interfaces';
import { RouteExperience, TravelMode, SmartStop } from '@/domain/journey.types';
import { WeatherPoint } from '@/domain/weather.types';
import { GeminiRecommendation } from '@/domain/recommendation.types';
import { demoRouteA, demoRouteB, demoGeminiRecommendation, demoJourney } from '@/data/demoJourney';

export class DemoRoutingProvider implements RoutingProvider {
  async getRoutes(origin: string, destination: string, mode: TravelMode): Promise<RouteExperience[]> {
    return [demoRouteA, demoRouteB];
  }
}

export class DemoWeatherProvider implements WeatherProvider {
  async getHourlyForecast(lat: number, lng: number): Promise<WeatherPoint[]> {
    // Return dummy points for demo
    return [];
  }
}

export class DemoPlacesProvider implements PlacesProvider {
  async findSmartStops(lat: number, lng: number, categories: string[]): Promise<SmartStop[]> {
    return demoJourney.smartStops;
  }
}

export class DemoGeminiProvider implements GeminiProvider {
  async generateStructuredRecommendation(context: any): Promise<GeminiRecommendation> {
    return demoGeminiRecommendation;
  }
}
