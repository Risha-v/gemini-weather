"use client";

import React from 'react';
import { useJourney } from '@/state/JourneyContext';
import { CloudRainWind } from 'lucide-react';
import { cn } from '@/lib/utils';
import EmergencyMode from './EmergencyMode';
import GeminiDecisionCard from './GeminiDecisionCard';
import RouteComparison from './RouteComparison';
import NavigationSteps from './NavigationSteps';

export default function IntelligenceContent() {
  const { journey, dispatch } = useJourney();

  if (!journey || journey.state === 'IDLE' || journey.state === 'ANALYZING' || !journey.routes || journey.routes.length === 0) {
    return null;
  }

  return (
    <>
      {/* Journey Setup Summary */}
      <div 
        className="flex flex-col gap-1 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-800/70 transition-colors shrink-0" 
        onClick={() => dispatch({ type: 'SET_STATE', payload: 'IDLE' })}
      >
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">From</span>
          <span className="font-semibold text-[11px]">{journey.origin.name}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">To</span>
          <span className="font-semibold text-[11px]">{journey.destination.name}</span>
        </div>
        <div className="text-[9px] text-indigo-400 text-center mt-0.5">Tap to edit journey</div>
      </div>

      {/* Emergency Banner */}
      {journey.state === 'EMERGENCY_MODE' && (
        <div className="shrink-0">
          <EmergencyMode />
        </div>
      )}

      {/* Normal Intelligence Panel */}
      <div className={cn("transition-opacity duration-500 flex flex-col gap-2 shrink-0", journey.state === 'EMERGENCY_MODE' ? "opacity-50 pointer-events-none" : "opacity-100")}>
        <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-700/50 shadow-md">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex justify-between">
            <span>Route Forecast</span>
            <span className="text-[9px] text-indigo-400 capitalize">Conditions may change</span>
          </h3>
          <div className="flex items-center gap-1.5">
            <CloudRainWind className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <p className="text-xs font-medium text-slate-200">
              {journey.routes[0]?.exposure?.earliestMeaningfulWeatherEvent || 'Clear conditions expected.'}
            </p>
          </div>
        </div>

        <GeminiDecisionCard />
        <RouteComparison />
        <NavigationSteps />
        
        {/* Padding for sticky footer or safe area */}
        <div className="h-4 shrink-0" />
      </div>
    </>
  );
}
