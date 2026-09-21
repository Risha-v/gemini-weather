"use client";

import React from 'react';
import { useJourney } from '@/state/JourneyContext';
import { CloudRain, Clock, Gauge, Route as RouteIcon, Cloud, Sun, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RouteComparison() {
  const { journey, dispatch } = useJourney();

  if (!journey || journey.routes.length === 0) return null;

  // Find fastest route
  const fastestRouteId = journey.routes.reduce((prev, curr) => 
    curr.durationSeconds < prev.durationSeconds ? curr : prev
  ).id;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Route Comparison</h3>
      
      <div className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory hide-scrollbar -mx-1 px-1">
        {journey.routes.map((route) => {
          const isSelected = journey.selectedRouteId === route.id;
          const avgSpeedKmh = (route.distanceMeters / 1000) / (route.durationSeconds / 3600);
          const isFastest = route.id === fastestRouteId;

          // Count weather conditions per km
          const weatherCounts = { clear: 0, cloudy: 0, rain: 0, heavy: 0 };
          (route.weatherSegments || []).forEach(ws => {
            if (ws.condition === 'HEAVY_RAIN' || ws.condition === 'STORM') weatherCounts.heavy++;
            else if (ws.condition === 'MODERATE_RAIN' || ws.condition === 'LIGHT_RAIN') weatherCounts.rain++;
            else if (ws.condition === 'CLOUDY') weatherCounts.cloudy++;
            else weatherCounts.clear++;
          });
          
          return (
            <div 
              key={route.id}
              onClick={() => dispatch({ type: 'SELECT_ROUTE', payload: route.id })}
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all duration-200 min-w-[260px] snap-center shrink-0",
                isSelected 
                  ? "bg-slate-800 border-blue-500 shadow-lg shadow-blue-500/10" 
                  : "bg-slate-900/50 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold text-lg">{route.label}</div>
                  {isFastest && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-900/60 text-blue-400 border border-blue-800">FASTEST</span>
                  )}
                  {avgSpeedKmh >= 50 ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-900/60 text-green-400 border border-green-800">HIGHWAY</span>
                  ) : avgSpeedKmh >= 30 ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-900/60 text-sky-400 border border-sky-800">GOOD ROAD</span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-900/60 text-orange-400 border border-orange-800">SLOW ROAD</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold">{Math.round(route.durationSeconds / 60)} min</div>
                  <div className="text-xs text-slate-400">{(route.distanceMeters / 1000).toFixed(1)} km</div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-3">
                {/* Avg Speed */}
                <div className="flex items-center gap-2 text-sm">
                  <Gauge className={cn("w-4 h-4", avgSpeedKmh >= 50 ? "text-green-400" : avgSpeedKmh >= 30 ? "text-sky-400" : "text-orange-400")} />
                  <span className="text-slate-300">Avg speed: <span className="font-semibold">{avgSpeedKmh.toFixed(0)} km/h</span></span>
                </div>

                {/* Weather per km breakdown */}
                {route.weatherSegments && route.weatherSegments.length > 0 && (
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {weatherCounts.clear > 0 && (
                      <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-amber-400" />{weatherCounts.clear} km clear</span>
                    )}
                    {weatherCounts.rain > 0 && (
                      <span className="flex items-center gap-1"><CloudRain className="w-3 h-3 text-blue-400" />{weatherCounts.rain} km rain</span>
                    )}
                    {weatherCounts.heavy > 0 && (
                      <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-red-400" />{weatherCounts.heavy} km heavy</span>
                    )}
                  </div>
                )}

                {/* Rain exposure */}
                <div className="flex items-center gap-2 text-sm">
                  <CloudRain className={cn("w-4 h-4", route.exposure.expectedHeavyRainExposureMinutes > 10 ? "text-red-400" : "text-blue-400")} />
                  <span className={cn(route.exposure.expectedHeavyRainExposureMinutes > 10 ? "text-red-300" : "text-blue-300")}>
                    ~{route.exposure.expectedHeavyRainExposureMinutes} min heavy rain
                  </span>
                </div>
                
                {route.routeLabels && route.routeLabels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {route.routeLabels.map((tradeoff, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 border border-slate-700">
                        {tradeoff}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
