"use client";

import React, { useState, useEffect } from 'react';
import { useJourney } from '@/state/JourneyContext';
import { Sparkles, ChevronDown, ChevronUp, Mic, Loader2 } from 'lucide-react';
import { demoGeminiRecommendation } from '@/data/demoJourney';
import { GeminiRecommendation } from '@/domain/recommendation.types';

export default function GeminiDecisionCard() {
  const { journey } = useJourney();
  const [expanded, setExpanded] = useState(false);
  const [recommendation, setRecommendation] = useState<GeminiRecommendation>(demoGeminiRecommendation);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!journey) return;
    
    let isMounted = true;
    
    const fetchRecommendation = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/journey/recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ journeyContext: journey })
        });
        
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.recommendation) {
            setRecommendation(data.recommendation);
          }
        } else {
          // Fallback to demo
          if (isMounted) setRecommendation(demoGeminiRecommendation);
        }
      } catch (err) {
        // Fallback to demo
        if (isMounted) setRecommendation(demoGeminiRecommendation);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchRecommendation();
    
    return () => { isMounted = false; };
  }, [journey?.selectedRouteId, journey?.departureTime, journey?.currentState]);

  if (!journey) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-2xl p-5 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-indigo-300">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold text-sm">Should I leave now?</span>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />}
          <div className="flex items-center gap-1 text-slate-400 text-xs bg-slate-900/50 px-2 py-1 rounded-full border border-slate-700">
            <Mic className="w-3 h-3" />
            <span>Voice-first</span>
          </div>
        </div>
      </div>
      
      <p className="text-lg leading-snug font-medium text-slate-100 mb-4 transition-opacity duration-300" style={{ opacity: loading ? 0.5 : 1 }}>
        {recommendation.summary}
      </p>
      
      <div className="flex gap-2 mb-4">
        {recommendation.actions.map((action, i) => (
          <button 
            key={i}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              i === 0 
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
            }`}
          >
            {action}
          </button>
        ))}
      </div>

      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        Why this recommendation?
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-indigo-500/20 text-sm text-slate-300 space-y-4">
          <div>
            <div className="text-xs text-indigo-400 font-semibold mb-3 uppercase tracking-wide">Evidence Chain</div>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center bg-slate-800/50 px-3 py-2 rounded border border-slate-700">
                <span className="text-slate-400 font-medium w-36 flex-shrink-0">ROUTE DATA</span>
                <span className="text-slate-200">+5 min travel time</span>
              </div>
              <div className="flex items-center bg-slate-800/50 px-3 py-2 rounded border border-slate-700">
                <span className="text-slate-400 font-medium w-36 flex-shrink-0">WEATHER MODEL</span>
                <span className="text-slate-200">~17 min lower expected heavy-rain exposure</span>
              </div>
              <div className="flex items-center bg-slate-800/50 px-3 py-2 rounded border border-slate-700">
                <span className="text-slate-400 font-medium w-36 flex-shrink-0">USER PREFERENCE</span>
                <span className="text-slate-200">Balanced</span>
              </div>
              <div className="flex items-center bg-indigo-900/30 px-3 py-2 rounded border border-indigo-500/30">
                <span className="text-indigo-400 font-medium w-36 flex-shrink-0">GEMINI REASONING</span>
                <span className="text-indigo-300 font-semibold">Route B recommended</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800/50">
            <p className="text-xs text-slate-400 italic">
              {recommendation.uncertainty}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
