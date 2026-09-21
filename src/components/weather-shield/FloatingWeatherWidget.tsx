"use client";

import React from 'react';
import { useJourney } from '@/state/JourneyContext';
import { Thermometer, Droplets, Wind, Eye, CloudRainWind } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FloatingWeatherWidget() {
  const { journey } = useJourney();

  if (!journey || !journey.routes || journey.routes.length === 0) return null;

  const selectedRoute = journey.routes.find(r => r.id === journey.selectedRouteId) || journey.routes[0];
  
  // Get the current (first) weather segment of the active route
  const currentSegment = selectedRoute.weatherSegments && selectedRoute.weatherSegments[0];
  if (!currentSegment) return null;

  const temp = Math.round(currentSegment.temperatureC);
  const feelsLike = currentSegment.feelsLikeC ? Math.round(currentSegment.feelsLikeC) : temp;
  const humidity = currentSegment.humidity ?? 0;
  const wind = Math.round(currentSegment.windKph);
  const visibility = currentSegment.visibilityKm;
  
  let conditionText = "Clear conditions expected";
  if (currentSegment.condition === 'HEAVY_RAIN') conditionText = "Heavy rain expected";
  else if (currentSegment.condition === 'MODERATE_RAIN') conditionText = "Moderate rain expected";
  else if (currentSegment.condition === 'LIGHT_RAIN') conditionText = "Partly cloudy with chance of rain";
  else if (currentSegment.condition === 'CLOUDY') conditionText = "Cloudy conditions expected";

  return (
    <div className="absolute top-4 right-4 z-10 w-[300px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-yellow-500">
            {currentSegment.condition === 'CLEAR' ? '☀️' : (currentSegment.condition === 'CLOUDY' ? '☁️' : '🌧️')}
          </div>
          <div>
            <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">
              {temp}°C
            </div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Feels like {feelsLike}°C
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
        {conditionText}
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Droplets className="w-5 h-5 text-blue-500 opacity-80" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Humidity</div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{humidity}%</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Wind className="w-5 h-5 text-teal-500 opacity-80" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Wind</div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{wind} km/h</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-slate-500 opacity-80" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visibility</div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{visibility} km</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Thermometer className="w-5 h-5 text-orange-500 opacity-80" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Feels live</div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{feelsLike}°C</div>
          </div>
        </div>
      </div>
    </div>
  );
}
