import React, { useState, useEffect } from 'react';
import { useJourney } from '@/state/JourneyContext';
import { ShieldAlert, Navigation, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EmergencyMode() {
  const { journey } = useJourney();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (journey?.currentState === 'EMERGENCY') {
      const timers = [
        setTimeout(() => setStep(1), 800),
        setTimeout(() => setStep(2), 1600),
        setTimeout(() => setStep(3), 2400)
      ];
      return () => timers.forEach(clearTimeout);
    } else {
      setStep(0);
    }
  }, [journey?.currentState]);

  if (!journey || journey.currentState !== 'EMERGENCY') return null;

  const currentAlert = journey.alerts[journey.alerts.length - 1];
  const recommendedStop = journey.smartStops.find(s => s.id === currentAlert?.recommendedStopId);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-6">
      <div className="bg-red-950/40 border border-red-500/50 rounded-2xl p-5 shadow-lg shadow-red-500/10">
        
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-600 rounded-full mt-1 animate-pulse">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <h2 className="text-red-400 font-bold uppercase tracking-wide text-sm flex items-center gap-2">
              <span>⚠ CONDITIONS CHANGED</span>
            </h2>
            
            {step >= 0 && (
              <p className="text-lg font-semibold text-white animate-in fade-in duration-300">
                Flooded road reported ahead
              </p>
            )}
            
            {step >= 1 && (
              <div className="mt-3 pt-3 border-t border-red-900/50 text-amber-400 font-bold text-sm tracking-widest uppercase animate-in fade-in duration-300">
                JOURNEY OBJECTIVE UPDATED
              </div>
            )}
            
            {step >= 2 && (
              <p className="text-slate-300 text-sm mt-1 animate-in fade-in duration-300 italic">
                Finding a reachable safe stop…
              </p>
            )}
          </div>
        </div>

        {step >= 3 && recommendedStop && (
          <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-700 mt-5 animate-in slide-in-from-bottom-2 fade-in duration-500">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-green-400 uppercase tracking-wide">SAFE STOP</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                {recommendedStop.category}
              </span>
            </div>
            <div className="text-sm text-slate-200 mb-4">
              <span className="font-medium">{recommendedStop.name}</span> <span className="text-slate-500 mx-1">•</span> {recommendedStop.distanceKm} km
            </div>
            
            <button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95">
              <Navigation className="w-5 h-5" />
              NAVIGATE TO SAFE STOP
            </button>
          </div>
        )}
      </div>
      
      {/* Visual indicator of voice mode */}
      {step >= 3 && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-start gap-3 animate-in fade-in duration-500">
          <div className="bg-indigo-500/20 p-1.5 rounded-full mt-0.5">
            <Volume2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            "Flooded road ahead. I found a covered stop {recommendedStop?.distanceKm} kilometers away."
          </p>
        </div>
      )}
    </div>
  );
}
