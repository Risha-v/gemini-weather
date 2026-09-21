"use client";

import React from 'react';
import { useJourney } from '@/state/JourneyContext';
import { cn } from '@/lib/utils';
import { CloudRain, Cloud, Sun, Moon, CloudLightning, Droplets } from 'lucide-react';
import { WeatherCondition } from '@/domain/journey.types';

const getWeatherIcon = (condition: WeatherCondition, className: string, isNight: boolean) => {
  switch (condition) {
    case 'CLEAR': return isNight ? <Moon className={className} /> : <Sun className={className} />;
    case 'CLOUDY': return <Cloud className={className} />;
    case 'LIGHT_RAIN': return <CloudRain className={className} />;
    case 'MODERATE_RAIN': return <CloudRain className={className} />;
    case 'HEAVY_RAIN': return <Droplets className={className} />;
    case 'STORM': return <CloudLightning className={className} />;
    default: return <Cloud className={className} />;
  }
};

const getConditionText = (condition: WeatherCondition) => {
  switch (condition) {
    case 'CLEAR': return "Clear";
    case 'CLOUDY': return "Cloudy";
    case 'LIGHT_RAIN': return "Drizzle";
    case 'MODERATE_RAIN': return "Rain";
    case 'HEAVY_RAIN': return "Heavy Rain";
    case 'STORM': return "Storm";
    default: return "";
  }
};

export default function JourneyTwin() {
  const { journey } = useJourney();

  if (!journey || !journey.journeyTwin || journey.journeyTwin.length === 0) return null;

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border-t border-slate-700/50 px-6 py-4">
      <div className="relative flex justify-between items-start">
        {/* Connecting line */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-600 z-0"></div>
        
        {journey.journeyTwin.map((point, index) => {
          const date = new Date(point.timestamp);
          const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const hours = date.getHours();
          const isNight = hours < 6 || hours >= 18;
          return (
            <div key={point.id || index} className="relative z-10 flex flex-col items-center gap-1.5 min-w-[70px]">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-3 border-slate-900 shadow-lg",
                point.condition === 'HEAVY_RAIN' ? "bg-red-500" : 
                point.condition === 'STORM' ? "bg-purple-500" :
                point.condition === 'CLEAR' ? "bg-amber-500" : "bg-blue-500"
              )}>
                {getWeatherIcon(point.condition, "w-5 h-5 text-white", isNight)}
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white">{timeString}</div>
                <div className="text-[10px] text-slate-400">{point.reason || "En Route"}</div>
                <div className={cn(
                  "text-[10px] font-semibold",
                  point.condition === 'HEAVY_RAIN' ? "text-red-400" : 
                  point.condition === 'STORM' ? "text-purple-400" : "text-slate-300"
                )}>
                  {getConditionText(point.condition)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
