import React, { useState } from 'react';
import { useJourney } from '@/state/JourneyContext';
import { Settings, FastForward, AlertTriangle, RefreshCw, Server, CloudRain } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DemoControls() {
  const { journey, dispatch } = useJourney();
  const [open, setOpen] = useState(false);

  if (!journey) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl flex flex-col gap-4 w-72 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="font-semibold text-xs text-slate-400 uppercase tracking-wide">Demo Controls</span>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center">
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-1">Scenario</div>
            <button 
              onClick={() => dispatch({ type: 'RESET_DEMO' })}
              className="w-full flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 py-1.5 px-3 rounded text-left border border-transparent hover:border-slate-600"
            >
              Normal
            </button>
            <button 
              onClick={() => dispatch({ 
                type: 'TRIGGER_EMERGENCY', 
                payload: { stopId: 'stop-1', reason: 'Flooded road reported.' } 
              })}
              className="w-full flex items-center gap-2 text-xs bg-red-900/30 text-red-300 hover:bg-red-900/50 py-1.5 px-3 rounded text-left border border-red-900/50 hover:border-red-500/50"
            >
              Simulate Flooded Road
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-1">Journey</div>
            <button 
              onClick={() => dispatch({ type: 'ADVANCE_TIME', payload: 10 })}
              className="w-full flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 py-1.5 px-3 rounded text-left border border-transparent hover:border-slate-600"
            >
              Wait 10 min (+10m)
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-1">System</div>
            <div className="flex gap-2">
              <button className="flex-1 text-xs bg-blue-900/50 text-blue-300 py-1.5 px-2 rounded border border-blue-700/50 text-center">Demo Mode</button>
              <button className="flex-1 text-xs bg-slate-800 text-slate-500 py-1.5 px-2 rounded border border-slate-700 text-center opacity-50 cursor-not-allowed">Live Mode</button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setOpen(true)}
          className="bg-slate-800 p-3 rounded-full shadow-lg border border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
          title="Demo Controls"
        >
          <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
        </button>
      )}
    </div>
  );
}
