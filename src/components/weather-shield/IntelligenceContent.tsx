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
        className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-800/70 transition-colors shrink-0" 
        onClick={() => dispatch({ type: 'SET_STATE', payload: 'IDLE' })}
      >
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">From</span>
          <span className="font-semibold text-xs">{journey.origin.name}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">To</span>
          <span className="font-semibold text-xs">{journey.destination.name}</span>
        </div>
        <div className="text-[10px] text-indigo-400 text-center mt-1">Tap to edit journey</div>
      </div>

      {/* Emergency Banner */}
      {journey.state === 'EMERGENCY_MODE' && (
        <div className="shrink-0">
          <EmergencyMode />
        </div>
      )}

      {/* Normal Intelligence Panel */}
      <div className={cn("transition-opacity duration-500 flex flex-col gap-3 shrink-0", journey.state === 'EMERGENCY_MODE' ? "opacity-50 pointer-events-none" : "opacity-100")}>
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/50 shadow-md">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between">
            <span>Route Forecast</span>
            <span className="text-[10px] text-indigo-400 capitalize">Conditions may change</span>
          </h3>
          <div className="flex items-center gap-2">
            <CloudRainWind className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <p className="text-sm font-medium text-slate-200">
              {journey.routes[0]?.exposure?.earliestMeaningfulWeatherEvent || 'Clear conditions expected.'}
            </p>
          </div>
        </div>

        <GeminiDecisionCard />
        <RouteComparison />
        <NavigationSteps />
        
        {/* Padding for sticky footer or safe area */}
        <div className="h-6 shrink-0" />
      </div>
    </>
  );
}
