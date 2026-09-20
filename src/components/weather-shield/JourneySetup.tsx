"use client";

import React, { useState } from 'react';
import { useJourney } from '@/state/JourneyContext';

export default function JourneySetup({ onPlayDemo }: { onPlayDemo?: () => void }) {
  const { journey, dispatch } = useJourney();
  const [analyzing, setAnalyzing] = useState(false);

  if (!journey) return null;

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      dispatch({ type: 'SET_STATE', payload: 'ANALYZED' });
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Plan a smarter journey.</h2>
        <p className="text-slate-400 mb-8">See what the route may feel like before you leave.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">From</label>
            <input type="text" value={journey.origin} readOnly className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">To</label>
            <input type="text" value={journey.destination} readOnly className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mode</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none appearance-none">
                <option>Two-wheeler</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Preference</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none appearance-none">
                <option>Balanced</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100"
          >
            {analyzing ? 'Analyzing Journey...' : 'Analyze Journey'}
          </button>
          
          <div className="text-center mt-4">
            <button 
              onClick={() => {
                if (onPlayDemo) onPlayDemo();
              }}
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 mx-auto"
            >
              ▶ PLAY 60-SECOND DEMO
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-12 max-w-2xl text-center text-slate-500 text-sm italic">
        "Turn Google Maps from a map that tells you where to go into a living journey assistant that tells you what you’ll face, when you’ll face it, and how to adapt before it happens."
      </div>
    </div>
  );
}
