import { RoutingProvider, WeatherProvider, PlacesProvider, GeminiProvider } from './interfaces';
import { Route, LocationPoint, SafeStop, JourneyRequest } from '@/domain/journey.types';
import { GeminiRecommendation } from '@/domain/recommendation.types';
import { demoRouteA, demoRouteB, demoGeminiRecommendation, demoSafeStop, demoOrigin, demoDestination } from '@/data/demoJourney';

export class DemoRoutingProvider implements RoutingProvider {
  async computeRoutes(request: JourneyRequest): Promise<Route[]> {
    return [demoRouteA, demoRouteB];
  }
  async refreshRoutes(request: JourneyRequest): Promise<Route[]> {
    return [demoRouteA, demoRouteB];
  }
}

export class DemoWeatherProvider implements WeatherProvider {
  async getForecast(lat: number, lng: number): Promise<any> {
    return {};
  }
}

export class DemoPlacesProvider implements PlacesProvider {
  async autocomplete(query: string, context?: any): Promise<any[]> {
    return [demoOrigin, demoDestination];
  }
  async getPlaceDetails(placeId: string): Promise<LocationPoint> {
    return demoDestination;
  }
  async nearbySearch(center: {lat: number, lng: number}, types: string[], radius: number): Promise<SafeStop[]> {
    return [demoSafeStop];
  }
}

export class DemoGeminiProvider implements GeminiProvider {
  async generateStructuredRecommendation(evidence: any): Promise<GeminiRecommendation> {
    return demoGeminiRecommendation;
  }
}
