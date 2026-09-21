"use client";

import React from 'react';
import { useJourney } from '@/state/JourneyContext';
import { Volume2, MapPin, ArrowUpCircle } from 'lucide-react';
import { speakText } from '@/lib/speech';

export default function NavigationSteps() {
  const { journey } = useJourney();

  if (!journey || journey.state === 'IDLE' || journey.state === 'ANALYZING') return null;

  const selectedRoute = journey.routes.find(r => r.id === journey.selectedRouteId) || journey.routes[0];
  if (!selectedRoute) return null;

  const legs = selectedRoute.legs || [];
  const steps = legs[0]?.steps || [];

  if (steps.length === 0) return null;

  return (
    <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/50 shadow-md flex flex-col max-h-[300px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-400" />
          Turn-by-turn Navigation
        </h3>
      </div>
      
      <div className="overflow-y-auto pr-2 flex flex-col gap-3 custom-scrollbar">
        {steps.map((step: any, index: number) => {
          const instruction = step.navigationInstruction?.instructions || "Continue on route";
          const distance = step.distanceMeters ? `${step.distanceMeters} m` : "";
          
          return (
            <div key={index} className="flex gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group">
              <div className="mt-1">
                <ArrowUpCircle className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="flex-1">
                <div 
                  className="text-sm font-medium text-slate-200" 
                  dangerouslySetInnerHTML={{ __html: instruction }} 
                />
                {distance && <div className="text-xs text-slate-400 mt-1">{distance}</div>}
              </div>
              <button
                onClick={() => {
                  // The instruction might contain HTML tags like <b> from Google API, so we strip them for speech
                  const textContent = instruction.replace(/<[^>]*>?/gm, '');
                  speakText(`In ${distance}, ${textContent}`);
                }}
                className="p-2 bg-slate-700/50 rounded-full hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors h-fit opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Read step aloud"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
