"use client";

import React, { useState, useEffect } from 'react';
import { useJourney } from '@/state/JourneyContext';
import { Sparkles, ChevronDown, ChevronUp, Loader2, Volume2, CloudLightning, Info, ShieldAlert } from 'lucide-react';
import { demoGeminiRecommendation } from '@/data/demoJourney';
import { GeminiRecommendation } from '@/domain/recommendation.types';
import { speakText } from '@/lib/speech';

export default function GeminiDecisionCard() {
  const { journey, dispatch } = useJourney();
  const [expanded, setExpanded] = useState(false);
  const [recommendation, setRecommendation] = useState<GeminiRecommendation>(demoGeminiRecommendation);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!journey) return;
    
    let isMounted = true;
    
    const fetchRecommendation = async () => {
      setLoading(true);
      try {
        // Sanitize payload to prevent massive token usage and 429 quota errors
        const sanitizedJourney = {
          ...journey,
          routes: journey.routes.map(r => ({
            ...r,
            path: undefined,
            legs: undefined,
            routeLabels: r.routeLabels,
            distanceMeters: r.distanceMeters,
            durationSeconds: r.durationSeconds,
            weatherSegments: r.weatherSegments,
            exposure: r.exposure
          })),
          journeyTwin: undefined
        };

        const res = await fetch('/api/journey/recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ journeyContext: sanitizedJourney })
        });
        
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.recommendation) {
            setRecommendation(data.recommendation);
          }
        } else {
          if (isMounted) {
            const errText = await res.text();
            console.warn("Gemini API warning (handled):", errText);
            setRecommendation(null as any); // Render error state
          }
        }
      } catch (err) {
        if (isMounted) setRecommendation(null as any);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchRecommendation();
    
    return () => { isMounted = false; };
  }, [journey?.selectedRouteId, journey?.departureTime, journey?.state]);

  if (!journey) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-xl p-3 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5 text-indigo-300">
          <Sparkles className="w-4 h-4" />
          <span className="font-semibold text-xs">Should I leave now?</span>
        </div>
        <div className="flex items-center gap-1.5">
          {loading && <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (recommendation) {
                const actionText = recommendation.actions.join('. ');
                speakText(`Gemini Recommendation: ${recommendation.explanation} Suggested actions: ${actionText}`);
              }
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/80 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-500 transition-colors"
            title="Read aloud"
          >
            <Volume2 className="w-3 h-3 text-slate-300" />
            <span className="text-[10px] font-medium text-slate-300">Voice</span>
          </button>
        </div>
      </div>
      
      <p className="text-xs leading-snug font-medium text-slate-100 mb-1.5 transition-opacity duration-300" style={{ opacity: loading ? 0.5 : 1 }}>
        {!recommendation ? (
          <span className="text-red-400 text-xs">Gemini AI Quota Exceeded. Please wait 1 minute and try again.</span>
        ) : (
          recommendation.explanation
        )}
      </p>
      
      {recommendation && (
        <>
          <div className="flex gap-1.5 mb-1.5">
            {recommendation.actions.map((action, i) => {
          const isRouteSelection = action.toLowerCase().includes('take route');
          const routeMatch = action.match(/route\s*([a-z])/i);
          const routeId = routeMatch ? `live-route-${routeMatch[1].toLowerCase().charCodeAt(0) - 97}` : null;
          
          return (
            <button 
              key={i}
              onClick={() => {
                if (isRouteSelection && routeId) {
                  dispatch({ type: 'SELECT_ROUTE', payload: routeId });
                }
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                i === 0 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
              }`}
            >
              {action}
            </button>
          );
        })}
      </div>

          {journey.state !== 'NAVIGATING' && (
            <button
              onClick={() => dispatch({ type: 'START_NAVIGATION' })}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-1.5 transition-all mb-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              Start Live Navigation
            </button>
          )}
          {journey.state === 'NAVIGATING' && (
            <div className="w-full py-1.5 bg-emerald-900/50 text-emerald-400 border border-emerald-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 mb-1.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Navigating
            </div>
          )}

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
      </>
      )}
    </div>
  );
}
