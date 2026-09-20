import { WeatherCondition, DataSource } from './journey.types';

export interface WeatherPoint {
  timestamp: number;
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  precipProbability: number;
  precipitationType: 'NONE' | 'RAIN' | 'SNOW' | 'SLEET';
  windKph: number;
  gustKph: number;
  visibilityKm: number;
  condition: WeatherCondition;
  source: DataSource;
}
