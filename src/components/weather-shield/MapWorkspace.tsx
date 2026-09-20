"use client";

import React from 'react';
import { useJourney } from '@/state/JourneyContext';
import { MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MapWorkspace() {
  const { journey } = useJourney();

  if (!journey) return null;

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center">
      {/* Decorative background grid for "map" feel */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Simulated Map Content */}
      <div className="relative w-full max-w-4xl h-full max-h-[800px] flex items-center justify-center p-8">
        
        {/* Route A Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <path 
            d="M 200,600 L 400,300 L 700,200" 
            fill="none" 
            stroke={journey.selectedRouteId === 'route-a' ? '#3b82f6' : '#475569'} 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="transition-colors duration-500"
          />
          {/* Route B Path */}
          <path 
            d="M 200,600 L 500,500 L 700,200" 
            fill="none" 
            stroke={journey.selectedRouteId === 'route-b' ? '#22c55e' : '#475569'} 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-colors duration-500"
          />
        </svg>

        {/* Rain Wall Animation */}
        <div 
          className="absolute w-96 h-96 rounded-full bg-blue-500/20 border border-blue-400/30 blur-xl pointer-events-none transition-all duration-1000 ease-in-out flex items-center justify-center"
          style={{
            top: journey.departureTime > new Date().setHours(16, 0, 0, 0) ? '10%' : '20%',
            left: journey.departureTime > new Date().setHours(16, 0, 0, 0) ? '60%' : '30%',
          }}
        >
          {/* Rain streaks */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjIwIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxMCIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjQpIiAvPjwvc3ZnPg==')] opacity-40 mix-blend-overlay"></div>
        </div>

        {/* Origin Marker */}
        <div className="absolute" style={{ top: '600px', left: '200px', transform: 'translate(-50%, -50%)' }}>
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-slate-900 border-2 border-slate-700 h-12 px-3 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xs font-bold text-white uppercase whitespace-nowrap overflow-hidden max-w-[100px] text-ellipsis">
                {journey.origin.name || 'START'}
              </span>
            </div>
          </div>
        </div>

        {/* Destination Marker */}
        <div className="absolute" style={{ top: '200px', left: '700px', transform: 'translate(-50%, -50%)' }}>
          <div className={cn("relative group cursor-pointer transition-opacity duration-500", journey.state === 'EMERGENCY_MODE' ? 'opacity-40 scale-75' : 'opacity-100')}>
            <div className="relative bg-slate-900 border-2 border-slate-700 h-12 px-3 rounded-full flex items-center justify-center shadow-lg">
               <span className="text-xs font-bold text-white uppercase whitespace-nowrap overflow-hidden max-w-[100px] text-ellipsis">
                 {journey.destination.name || 'END'}
               </span>
            </div>
          </div>
        </div>

        {/* Incident Marker (Emergency Mode) */}
        {journey.state === 'EMERGENCY_MODE' && (
          <>
            <div className="absolute" style={{ top: '400px', left: '450px', transform: 'translate(-50%, -50%)' }}>
               <div className="relative animate-bounce">
                  <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-red-400">
                    Flood
                  </div>
               </div>
            </div>

            {/* Safe Stop Marker */}
            {journey.incidents.length > 0 && journey.safeStops.find(s => s.id === journey.incidents[journey.incidents.length - 1].recommendedStopId) && (
              <div className="absolute z-20" style={{ top: '350px', left: '550px', transform: 'translate(-50%, -50%)' }}>
                <div className="relative group cursor-pointer animate-in zoom-in duration-500">
                  <div className="absolute inset-0 bg-green-500 rounded-full blur-md opacity-80 group-hover:opacity-100 transition-opacity animate-pulse" />
                  <div className="relative bg-green-900 border-2 border-green-500 px-4 py-2 rounded-full flex items-center justify-center shadow-xl">
                    <span className="text-xs font-bold text-white tracking-wider">SAFE STOP</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
