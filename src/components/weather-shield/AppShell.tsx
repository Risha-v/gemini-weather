"use client";

import React from 'react';
import { useJourney } from '@/state/JourneyContext';
import MapWorkspace from './MapWorkspace';
import RouteComparison from './RouteComparison';
import JourneyTwin from './JourneyTwin';
import GeminiDecisionCard from './GeminiDecisionCard';
import EmergencyMode from './EmergencyMode';
import DemoControls from './DemoControls';
import JourneySetup from './JourneySetup';
import { CloudRainWind } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AppShell() {
  const { journey, dispatch } = useJourney();

  const [autoDemoActive, setAutoDemoActive] = React.useState(false);

  React.useEffect(() => {
    if (autoDemoActive) {
      // 0-8s: Analyzing (done before we get here, so we are at ~8s mark)
      
      // 18s: Switch to Route A to show FASTEST but HIGH EXPOSURE
      const t1 = setTimeout(() => {
        dispatch({ type: 'SELECT_ROUTE', payload: 'route-a' });
      }, 10000); // 10s after analysis

      // 25s: Switch back to Route B to show LOWER EXPOSURE
      const t2 = setTimeout(() => {
        dispatch({ type: 'SELECT_ROUTE', payload: 'route-b' });
      }, 17000); // 17s after analysis

      // 45s: Trigger Flooded Road
      const t3 = setTimeout(() => {
        dispatch({ type: 'TRIGGER_EMERGENCY', payload: { stopId: 'stop-1', reason: 'Flooded road reported.' } });
      }, 37000); // 37s after analysis (roughly 45s into the 60s pitch)

      // 55s: Stop auto demo
      const t4 = setTimeout(() => {
        setAutoDemoActive(false);
      }, 47000); // 47s after analysis

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [autoDemoActive, dispatch]);

  if (!journey) return null;

  const startAutoDemo = () => {
    dispatch({ type: 'SET_STATE', payload: 'ANALYZED' });
    setAutoDemoActive(true);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <CloudRainWind className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight">GEMINI WEATHER SHIELD</h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-900/40 text-indigo-300 border border-indigo-800">
                CONCEPT PROTOTYPE · FUTURE GOOGLE MAPS EXPERIENCE
              </span>
            </div>
            <p className="text-sm text-slate-400">Living route intelligence.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {autoDemoActive && (
            <span className="text-[10px] uppercase font-bold text-red-400 animate-pulse border border-red-500/30 px-2 py-1 rounded">
              Playing Demo
            </span>
          )}
          <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
            Demo Simulation
          </span>
        </div>
      </header>

      {journey.state === 'IDLE' ? (
        <JourneySetup onPlayDemo={startAutoDemo} />
      ) : (
        <div className="flex flex-1 overflow-hidden relative">
          {/* Intelligence Panel (Sidebar on desktop) */}
          <aside className="w-full md:w-[450px] lg:w-[500px] flex-shrink-0 border-r border-slate-800 bg-slate-900/50 flex flex-col h-full overflow-y-auto z-10">
            
            <div className="p-6 flex flex-col gap-6">
              {/* Journey Setup Summary */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">From</span>
                  <span className="font-semibold">{journey.origin.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">To</span>
                  <span className="font-semibold">{journey.destination.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-slate-700/50">
                  <span className="text-slate-400">Mode</span>
                  <span className="font-semibold">{journey.travelMode.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Emergency Banner */}
              {journey.state === 'EMERGENCY_MODE' && (
                <EmergencyMode />
              )}

              {/* Normal Intelligence Panel */}
              <div className={cn("transition-opacity duration-500", journey.state === 'EMERGENCY_MODE' ? "opacity-50 pointer-events-none" : "opacity-100")}>
                <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/50 shadow-md mb-6">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Your Route Forecast</span>
                    <span className="text-xs text-indigo-400 capitalize">Forecast estimate · conditions may change</span>
                  </h3>
                  <div className="flex items-center gap-3">
                    <CloudRainWind className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="font-medium text-slate-200">
                        Rain is estimated to reach this route segment in ~18 minutes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <GeminiDecisionCard />
                </div>
                <RouteComparison />
              </div>
            </div>
          </aside>

          {/* Map Workspace */}
          <main className="flex-1 relative bg-slate-950 flex flex-col">
            <MapWorkspace />
            
            {/* Journey Twin at bottom of map */}
            <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-auto">
              <JourneyTwin />
            </div>
          </main>
        </div>
      )}

      <DemoControls />
    </div>
  );
}
