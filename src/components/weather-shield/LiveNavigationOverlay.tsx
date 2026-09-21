"use client";

import React, { useMemo } from 'react';
import { useJourney } from '@/state/JourneyContext';
import { ArrowUp, CornerUpLeft, CornerUpRight, MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

export default function LiveNavigationOverlay() {
  const { journey, dispatch } = useJourney();

  if (!journey || journey.state !== 'NAVIGATING') return null;

  const selectedRoute = journey.routes.find(r => r.id === journey.selectedRouteId) || journey.routes[0];
  if (!selectedRoute) return null;

  const steps = selectedRoute.legs?.[0]?.steps || [];
  const activeIndex = journey.activeNavigationStepIndex || 0;
  const currentStep = steps[activeIndex];
  
  if (!currentStep) return null;

  const location = journey.liveLocation;
  
  // Calculate remaining distance to the maneuver
  let remainingDistance = currentStep.distanceMeters || 0;
  if (location && currentStep.endLocation?.latLng) {
    const endLoc = currentStep.endLocation.latLng;
    const distToEnd = getDistanceMeters(
      location.lat, location.lng,
      endLoc.latitude, endLoc.longitude
    );
    // If we've started moving, we update the distance
    if (distToEnd < remainingDistance) {
      remainingDistance = distToEnd;
    }
  }

  // Format distance
  const formattedDistance = remainingDistance > 1000 
    ? `${(remainingDistance / 1000).toFixed(1)} km` 
    : `${Math.round(remainingDistance / 10) * 10} m`;

  const instructionHtml = currentStep.navigationInstruction?.instructions || "Continue";
  const plainInstruction = instructionHtml.replace(/<[^>]*>?/gm, '');

  // Extract primary instruction (before "onto")
  const parts = plainInstruction.split(/onto|towards|pass by/i);
  const primaryAction = parts[0].trim();
  const secondaryContext = parts.length > 1 ? parts[1].trim() : "";

  // Determine Icon based on text
  let TurnIcon = ArrowUp;
  if (plainInstruction.toLowerCase().includes('left')) TurnIcon = CornerUpLeft;
  if (plainInstruction.toLowerCase().includes('right')) TurnIcon = CornerUpRight;
  if (plainInstruction.toLowerCase().includes('arrive')) TurnIcon = MapPin;

  // Next step preview
  const nextStep = steps[activeIndex + 1];
  const nextInstruction = nextStep ? nextStep.navigationInstruction?.instructions.replace(/<[^>]*>?/gm, '') : null;

  return (
    <div className="absolute top-4 left-4 z-50 pointer-events-auto flex flex-col shadow-2xl rounded-xl overflow-hidden max-w-sm md:max-w-md w-full border border-emerald-900/50 transition-all duration-500 animate-in slide-in-from-top-4 fade-in">
      
      {/* Primary Banner */}
      <div className="bg-emerald-700 text-white p-4 flex items-center gap-4">
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-16">
          <TurnIcon className="w-10 h-10 text-white drop-shadow-md" strokeWidth={2.5} />
          <div className="font-bold text-lg mt-1 tracking-tight drop-shadow-md">{formattedDistance}</div>
        </div>
        <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
          <h2 className="text-xl md:text-2xl font-bold leading-tight drop-shadow-sm truncate" title={primaryAction}>
            {primaryAction}
          </h2>
          {secondaryContext && (
            <p className="text-emerald-100 text-sm md:text-base font-medium truncate mt-0.5" title={secondaryContext}>
              towards {secondaryContext}
            </p>
          )}
        </div>
        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
          <Navigation className="w-5 h-5 text-white" />
        </div>
      </div>
      
      {/* Secondary Banner (Then...) */}
      {nextInstruction && (
        <div className="bg-emerald-900/95 text-emerald-100 px-4 py-2 text-sm font-medium flex items-center gap-2 border-t border-emerald-800 backdrop-blur-md">
          <span className="text-emerald-300">Then</span>
          <span className="truncate">{nextInstruction}</span>
        </div>
      )}
      
      {/* Action Footer */}
      <div className="bg-slate-900/90 text-white px-4 py-2 text-sm font-medium flex justify-end border-t border-slate-700/50 backdrop-blur-md">
        <button
          onClick={() => {
            dispatch({ type: 'SET_STATE', payload: 'ANALYZED' });
          }}
          className="text-red-400 hover:text-red-300 transition-colors text-xs font-bold uppercase tracking-wider"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
