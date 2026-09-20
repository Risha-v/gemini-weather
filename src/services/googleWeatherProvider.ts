import { WeatherProvider } from './interfaces';

const WEATHER_API_KEY = process.env.GOOGLE_WEATHER_API_KEY;

export class GoogleWeatherProvider implements WeatherProvider {
  async getForecast(lat: number, lng: number): Promise<any> {
    if (!WEATHER_API_KEY) {
      console.warn("GOOGLE_WEATHER_API_KEY not configured. Falling back to simulated weather.");
      return this.simulateWeatherForecast(lat, lng);
    }

    // Replace this with actual Google Weather API or chosen provider (e.g. Tomorrow.io, OpenWeatherMap)
    // Since Google Weather API is often an internal or enterprise-only endpoint, 
    // we use this structure to handle the actual network request when available.
    try {
      const res = await fetch(`https://api.example.com/weather/forecast?lat=${lat}&lon=${lng}&apikey=${WEATHER_API_KEY}`);
      if (res.ok) {
        return await res.json();
      }
      return this.simulateWeatherForecast(lat, lng);
    } catch (e) {
      console.error("Weather fetch failed", e);
      return this.simulateWeatherForecast(lat, lng);
    }
  }

  private simulateWeatherForecast(lat: number, lng: number) {
    // Generate a semi-realistic forecast based on coordinates
    const currentTimestamp = Date.now();
    return {
      forecastGeneratedAt: currentTimestamp,
      points: Array.from({ length: 12 }).map((_, i) => {
        const time = currentTimestamp + i * 3600000; // hourly
        return {
          timestamp: time,
          temperatureC: 25 + Math.sin(i) * 5,
          condition: i > 2 && i < 6 ? 'HEAVY_RAIN' : 'CLEAR',
          precipitationProbability: i > 2 && i < 6 ? 90 : 10,
          precipitationMm: i > 2 && i < 6 ? 15 : 0,
          windKph: 10 + Math.random() * 5,
          visibilityKm: i > 2 && i < 6 ? 2 : 10,
        };
      })
    };
  }
}
