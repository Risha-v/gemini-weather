"use client";

import React, { useEffect, useState } from 'react';
import { useJourney } from '@/state/JourneyContext';
import { CloudLightning, AlertTriangle, Route as RouteIcon, X } from 'lucide-react';
import { speakText } from '@/lib/speech';

export default function RainImminentPopup() {
  const { journey, dispatch } = useJourney();
  const [dismissed, setDismissed] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);

  // Reset states when navigation restarts
  useEffect(() => {
    if (journey?.state !== 'NAVIGATING') {
      setDismissed(false);
      setHasSpoken(false);
    }
  }, [journey?.state]);

  if (!journey || journey.state !== 'NAVIGATING' || dismissed) return null;

  const selectedRoute = journey.routes.find(r => r.id === journey.selectedRouteId) || journey.routes[0];
  if (!selectedRoute) return null;

  const location = journey.liveLocation;
  if (!location) return null;

  // Find if rain is imminent (within 10 minutes)
  const imminentRainSegment = selectedRoute.weatherSegments.find(ws => {
    const isRaining = ['LIGHT_RAIN', 'MODERATE_RAIN', 'HEAVY_RAIN', 'STORM'].includes(ws.condition);
    if (!isRaining) return false;
    
    const timeToRainMs = ws.segmentStartTime - location.timestamp;
    // greater than 0 so we're not already in it, less than 10 mins
    return timeToRainMs > 0 && timeToRainMs <= 10 * 60000;
  });

  if (!imminentRainSegment) return null;

  const minutesUntilRain = Math.ceil((imminentRainSegment.segmentStartTime - location.timestamp) / 60000);
  const conditionName = imminentRainSegment.condition.replace('_', ' ').toLowerCase();

  // Voice alert once
  if (!hasSpoken) {
    speakText(`Warning. ${conditionName} expected in approximately ${minutesUntilRain} minutes on your current route. Seek shelter or tap reroute to avoid it.`);
    setHasSpoken(true);
  }

  // Find an alternate route to suggest (one with less rain or just another route)
  const alternateRoute = journey.routes.find(r => r.id !== journey.selectedRouteId);

  const handleReroute = () => {
    if (alternateRoute) {
      dispatch({ type: 'SELECT_ROUTE', payload: alternateRoute.id });
      setDismissed(true);
      speakText(`Rerouting to ${alternateRoute.label}.`);
    }
  };

  return (
    <div className="absolute top-36 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-50 animate-in slide-in-from-top-10 fade-in duration-500">
      <div className="bg-gradient-to-r from-red-950 to-orange-950 border border-red-500/50 shadow-2xl shadow-red-900/20 rounded-2xl p-4 relative overflow-hidden">
        {/* Warning Icon Background */}
        <CloudLightning className="absolute -right-4 -top-4 w-32 h-32 text-red-500/10 pointer-events-none" />
        
        <button 
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 text-red-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          
          <div className="pr-6">
            <h3 className="text-lg font-bold text-white leading-tight">
              {conditionName.replace(/\b\w/g, l => l.toUpperCase())} Imminent
            </h3>
            <p className="text-red-200 text-sm mt-1 mb-4 leading-snug">
              Heavy precipitation expected in <strong>{minutesUntilRain} min</strong>. Keep a shelter, wear a raincoat, or take an alternate route to avoid it.
            </p>

            {alternateRoute && (
              <button 
                onClick={handleReroute}
                className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-900/50"
              >
                <RouteIcon className="w-4 h-4" />
                Reroute to {alternateRoute.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
