"use client";

import React, { useEffect, useRef } from 'react';
import { useJourney } from '@/state/JourneyContext';
import { Volume2, MapPin, ArrowUpCircle } from 'lucide-react';
import { speakText } from '@/lib/speech';
import { cn } from '@/lib/utils';

export default function NavigationSteps() {
  const { journey } = useJourney();
  const listRef = useRef<HTMLDivElement>(null);

  if (!journey || journey.state === 'IDLE' || journey.state === 'ANALYZING') return null;

  const selectedRoute = journey.routes.find(r => r.id === journey.selectedRouteId) || journey.routes[0];
  if (!selectedRoute) return null;

  const legs = selectedRoute.legs || [];
  const steps = legs[0]?.steps || [];

  if (steps.length === 0) return null;

  const activeIndex = journey.activeNavigationStepIndex || 0;

  // Auto-scroll to active step
  useEffect(() => {
    if (listRef.current && activeIndex > 0) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  return (
    <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-700/50 shadow-md flex flex-col max-h-[250px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          Turn-by-turn Navigation
        </h3>
      </div>
      
      <div ref={listRef} className="overflow-y-auto pr-2 flex flex-col gap-2 custom-scrollbar">
        {steps.map((step: any, index: number) => {
          const instruction = step.navigationInstruction?.instructions || "Continue on route";
          const distance = step.distanceMeters ? `${step.distanceMeters} m` : "";
          
          const isActive = index === activeIndex;
          const isPassed = index < activeIndex;
          
          return (
            <div 
              key={index} 
              className={cn(
                "flex gap-2 p-2 rounded-md transition-all group shrink-0",
                isActive ? "bg-indigo-900/50 border border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]" :
                isPassed ? "bg-slate-800/30 opacity-60" : "bg-slate-800/50 hover:bg-slate-800"
              )}
            >
              <div className="mt-0.5">
                <ArrowUpCircle className={cn("w-4 h-4", isActive ? "text-indigo-400" : "text-slate-500")} />
              </div>
              <div className="flex-1">
                <div 
                  className={cn("text-xs font-medium leading-snug", isActive ? "text-white font-bold" : "text-slate-300")} 
                  dangerouslySetInnerHTML={{ __html: instruction }} 
                />
                {distance && <div className={cn("text-[10px] mt-0.5", isActive ? "text-indigo-300 font-bold" : "text-slate-500")}>{distance}</div>}
              </div>
              <button
                onClick={() => {
                  const textContent = instruction.replace(/<[^>]*>?/gm, '');
                  speakText(`In ${distance}, ${textContent}`);
                }}
                className={cn(
                  "p-1.5 rounded-full transition-colors h-fit group-hover:opacity-100 focus:opacity-100",
                  isActive ? "bg-indigo-600 hover:bg-indigo-500 text-white opacity-100" : "bg-slate-700/50 hover:bg-indigo-600 text-slate-300 hover:text-white opacity-0"
                )}
                title="Read step aloud"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
