"use client";

import React from 'react';
import { useJourney } from '@/state/JourneyContext';
import { CloudRain, Clock, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RouteComparison() {
  const { journey, dispatch } = useJourney();

  if (!journey) return null;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Route Comparison</h3>
      
      <div className="flex flex-col gap-3">
        {journey.routes.map((route) => {
          const isSelected = journey.selectedRouteId === route.id;
          
          return (
            <div 
              key={route.id}
              onClick={() => dispatch({ type: 'SELECT_ROUTE', payload: route.id })}
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all duration-200",
                isSelected 
                  ? "bg-slate-800 border-blue-500 shadow-lg shadow-blue-500/10" 
                  : "bg-slate-900/50 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-lg">{route.label}</div>
                  {route.id === 'route-a' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">FASTEST</span>
                  )}
                  {route.id === 'route-b' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-900/60 text-green-400 border border-green-800">LOWER EXPOSURE</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold">{route.durationMinutes} min</div>
                  <div className="text-xs text-slate-400">{route.distanceKm} km</div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <CloudRain className={cn("w-4 h-4", route.exposure.heavyRainMinutes > 10 ? "text-red-400" : "text-blue-400")} />
                  <span className={cn(route.exposure.heavyRainMinutes > 10 ? "text-red-300" : "text-blue-300")}>
                    ~{route.exposure.heavyRainMinutes} min heavy rain
                  </span>
                </div>
                
                {route.tradeoffs.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {route.tradeoffs.map((tradeoff, i) => (
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
