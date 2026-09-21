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
import NavigationSteps from './NavigationSteps';
import { useLiveNavigation } from '@/hooks/useLiveNavigation';
import { CloudRainWind } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APIProvider } from '@vis.gl/react-google-maps';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-10 text-white bg-red-900 absolute inset-0 z-50 overflow-auto">
        <h1 className="text-2xl font-bold">Something went wrong.</h1>
        <pre className="mt-4 text-xs whitespace-pre-wrap">{this.state.error?.stack}</pre>
      </div>;
    }
    return this.props.children;
  }
}

export default function AppShell() {
  const { journey, dispatch } = useJourney();
  useLiveNavigation(); // Hook for live GPS tracking

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
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} onLoad={() => console.log('Maps API Loaded')}>
      <div className="flex flex-col h-[100dvh] bg-slate-950 text-slate-50 overflow-hidden">
        {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <CloudRainWind className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">GEMINI WEATHER SHIELD</h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-900/40 text-indigo-300 border border-indigo-800">
                CONCEPT PROTOTYPE · FUTURE GOOGLE MAPS EXPERIENCE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">Living route intelligence.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {autoDemoActive && (
            <span className="text-[10px] uppercase font-bold text-red-400 animate-pulse border border-red-500/30 px-2 py-1 rounded">
              Playing Demo
            </span>
          )}
          <span className="hidden sm:inline-block text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
            Demo Simulation
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative flex-col md:flex-row">
        
        {/* Map Workspace (Now Full Screen Background) */}
        <main className="absolute inset-0 z-0 bg-slate-950 flex flex-col w-full h-full">
          <ErrorBoundary>
            <MapWorkspace />
          </ErrorBoundary>
          
          {/* Journey Twin at bottom of map */}
          {(journey.state !== 'IDLE' && journey.state !== 'ANALYZING' && journey.journeyTwin && journey.journeyTwin.length > 0) && (
            <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-auto">
              <JourneyTwin />
            </div>
          )}
        </main>

        {/* Intelligence Panel / Search Sidebar (Now Floating) */}
        <aside className="absolute top-2 left-2 w-[calc(100vw-16px)] sm:w-[320px] flex-shrink-0 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl flex flex-col max-h-[calc(100dvh-150px)] sm:max-h-[calc(100vh-200px)] overflow-y-auto z-20 shadow-2xl pointer-events-auto custom-scrollbar">
          <div className="p-3 flex flex-col gap-3">
            
            {/* Always show Search/Setup when no route is ready or explicitly requested */}
            {(journey.state === 'IDLE' || journey.state === 'ANALYZING' || !journey.routes || journey.routes.length === 0) ? (
              <JourneySetup onPlayDemo={startAutoDemo} />
            ) : (
              <>
                {/* Journey Setup Summary */}
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-800/70 transition-colors" onClick={() => dispatch({ type: 'SET_STATE', payload: 'IDLE' })}>
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
                {journey.state === 'EMERGENCY_MODE' && <EmergencyMode />}

                {/* Normal Intelligence Panel */}
                <div className={cn("transition-opacity duration-500 flex flex-col gap-3", journey.state === 'EMERGENCY_MODE' ? "opacity-50 pointer-events-none" : "opacity-100")}>
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
                </div>
              </>
            )}
          </div>
        </aside>

      </div>

        <DemoControls />
      </div>
    </APIProvider>
  );
}
