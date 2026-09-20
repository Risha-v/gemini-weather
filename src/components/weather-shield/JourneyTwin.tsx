"use client";

import React from 'react';
import { useJourney } from '@/state/JourneyContext';
import { cn } from '@/lib/utils';
import { CloudRain, Cloud, Sun, CloudLightning, Droplets } from 'lucide-react';
import { WeatherCondition } from '@/domain/journey.types';

const getWeatherIcon = (condition: WeatherCondition, className: string) => {
  switch (condition) {
    case 'CLEAR': return <Sun className={className} />;
    case 'CLOUDY': return <Cloud className={className} />;
    case 'LIGHT_RAIN': return <CloudRain className={className} />;
    case 'MODERATE_RAIN': return <CloudRain className={className} />;
    case 'HEAVY_RAIN': return <Droplets className={className} />;
    case 'STORM': return <CloudLightning className={className} />;
    default: return <Cloud className={className} />;
  }
};

export default function JourneyTwin() {
  const { journey } = useJourney();

  if (!journey || !journey.journeyTwin || journey.journeyTwin.length === 0) return null;

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-6 mx-4 mb-4 rounded-2xl shadow-2xl">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Your Journey Twin</h3>
      
      <div className="relative flex justify-between items-center px-4">
        {/* Connecting line */}
        <div className="absolute top-4 left-10 right-10 h-1 bg-slate-700 z-0"></div>
        
        {journey.journeyTwin.map((point, index) => {
          const date = new Date(point.timestamp);
          const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          return (
            <div key={point.id || index} className="relative z-10 flex flex-col items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-900",
                point.condition === 'HEAVY_RAIN' ? "bg-red-500" : 
                point.condition === 'CLEAR' ? "bg-amber-500" : "bg-blue-500"
              )}>
                {getWeatherIcon(point.condition, "w-4 h-4 text-white")}
              </div>
              <div className="text-center">
                <div className="font-bold">{timeString}</div>
                <div className="text-xs text-slate-400">{point.reason || "En Route"}</div>
                <div className={cn(
                  "text-xs font-medium mt-1",
                  point.condition === 'HEAVY_RAIN' ? "text-red-400" : "text-slate-300"
                )}>
                  {point.exposureState || "Clear"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
