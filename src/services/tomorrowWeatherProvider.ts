import { WeatherProvider } from './interfaces';

const WEATHER_API_KEY = process.env.TOMORROW_API_KEY;

export class TomorrowWeatherProvider implements WeatherProvider {
  async getForecast(lat: number, lng: number): Promise<any> {
    if (!WEATHER_API_KEY) {
      console.warn("TOMORROW_API_KEY not configured. Falling back to simulated weather.");
      return this.simulateWeatherForecast(lat, lng);
    }

    try {
      const res = await fetch(`https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lng}&apikey=${WEATHER_API_KEY}`);
      if (res.ok) {
        const data = await res.json();
        
        // Map Tomorrow.io to our structure
        const mappedPoints = data.timelines.hourly.map((point: any) => {
          const v = point.values;
          
          let condition = 'CLEAR';
          if (v.weatherCode >= 1001 && v.weatherCode <= 1102) condition = 'CLOUDY';
          if (v.weatherCode === 4000 || v.weatherCode === 4200) condition = 'LIGHT_RAIN';
          if (v.weatherCode === 4001) condition = 'MODERATE_RAIN';
          if (v.weatherCode === 4201) condition = 'HEAVY_RAIN';
          if (v.weatherCode >= 8000) condition = 'STORM';

          return {
            timestamp: new Date(point.time).getTime(),
            temperatureC: v.temperature,
            feelsLikeC: v.temperatureApparent || v.temperature,
            humidity: v.humidity || 0,
            condition: condition,
            precipitationProbability: v.precipitationProbability,
            precipitationMm: v.rainIntensity || 0,
            windKph: (v.windSpeed || 0) * 3.6, // Assuming m/s default
            visibilityKm: v.visibility || 10,
          };
        });

        return {
          forecastGeneratedAt: Date.now(),
          points: mappedPoints
        };
      }
      return this.simulateWeatherForecast(lat, lng);
    } catch (e) {
      console.error("Weather fetch failed", e);
      return this.simulateWeatherForecast(lat, lng);
    }
  }

  private simulateWeatherForecast(lat: number, lng: number) {
    const currentTimestamp = Date.now();
    return {
      forecastGeneratedAt: currentTimestamp,
      points: Array.from({ length: 12 }).map((_, i) => {
        const time = currentTimestamp + i * 3600000;
        return {
          timestamp: time,
          temperatureC: 25 + Math.sin(i) * 5,
          feelsLikeC: 27 + Math.sin(i) * 5,
          humidity: i > 2 && i < 6 ? 85 : 45,
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
