"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useJourney } from '@/state/JourneyContext';
import { PlaceAutocompleteInput } from '@/components/search/PlaceAutocompleteInput';

export default function JourneySetup({ onPlayDemo }: { onPlayDemo?: () => void }) {
  const { journey, dispatch } = useJourney();
  const [analyzing, setAnalyzing] = useState(false);
  const [locating, setLocating] = useState(false);
  const analysisRequestId = useRef(0);

  if (!journey) return null;

  const analyzeJourney = async () => {
    if (journey.origin.status !== 'selected' || journey.destination.status !== 'selected') return;
    if (!journey.origin.lat || !journey.destination.lat) return;
    
    setAnalyzing(true);
    analysisRequestId.current += 1;
    const currentRequestId = analysisRequestId.current;

    try {
      const appMode = process.env.NEXT_PUBLIC_APP_MODE || 'demo';
      const res = await fetch('/api/journey/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: journey, mode: appMode })
      });
      
      if (currentRequestId !== analysisRequestId.current) return;

      if (res.ok) {
        const data = await res.json();
        dispatch({ type: 'SET_JOURNEY', payload: data.journey });
      } else {
        dispatch({ type: 'SET_STATE', payload: 'ANALYZED' });
      }
    } catch (e) {
      if (currentRequestId !== analysisRequestId.current) return;
      console.error("Analyze error", e);
      dispatch({ type: 'SET_STATE', payload: 'ANALYZED' });
    } finally {
      if (currentRequestId === analysisRequestId.current) {
        setAnalyzing(false);
      }
    }
  };



  const requestGeolocation = () => {
    if (!('geolocation' in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        let resolvedName = "Current location";
        let formattedAddress = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        let placeId = undefined;

        try {
          const geocoder = new google.maps.Geocoder();
          const result = await geocoder.geocode({ location: { lat, lng } });
          if (result.results && result.results.length > 0) {
            const bestResult = result.results[0];
            placeId = bestResult.place_id;
            // Prefer the most concise readable part of the address
            const locality = bestResult.address_components.find(c => c.types.includes('locality'));
            const adminArea = bestResult.address_components.find(c => c.types.includes('administrative_area_level_1'));
            
            if (locality && adminArea) {
              resolvedName = `${locality.long_name}, ${adminArea.long_name}`;
            } else {
              resolvedName = bestResult.formatted_address.split(',')[0];
            }
            formattedAddress = bestResult.formatted_address;
          }
        } catch (e) {
          console.warn("Reverse geocoding failed", e);
        }

        console.log('CURRENT_LOCATION_GEOCODED', { name: resolvedName, address: formattedAddress, accuracy });

        dispatch({
          type: 'UPDATE_SETUP',
          payload: {
            origin: {
              placeId,
              name: resolvedName,
              address: formattedAddress,
              lat,
              lng,
              source: 'geolocation',
              status: 'selected',
              accuracyMeters: accuracy
            }
          }
        });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        console.warn("Geolocation error", err);
        if (err.code === err.PERMISSION_DENIED) {
          alert("Location permission was denied. Search for your starting point instead.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          alert("Your current location could not be determined. Try again or search manually.");
        } else if (err.code === err.TIMEOUT) {
          alert("Location lookup timed out. Try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleClearLocation = (type: 'origin' | 'destination') => {
    dispatch({
      type: 'UPDATE_SETUP',
      payload: {
        [type]: { name: '', lat: 0, lng: 0, source: 'manual', status: 'empty', inputText: '' },
        routes: [],
        journeyTwin: [],
        recommendation: null,
        selectedRouteId: null,
        state: 'IDLE'
      }
    });
  };

  const canAnalyze = journey.origin.status === 'selected' && journey.destination.status === 'selected' && !!journey.origin.lat && !!journey.destination.lat;
  
  let buttonLabel = "Select locations to analyze";
  if (analyzing) buttonLabel = "Analyzing Journey...";
  else if (journey.state === 'ANALYZED' || journey.state === 'NAVIGATING') buttonLabel = "Recalculate Journey";
  else if (journey.origin.status !== 'selected') buttonLabel = "Select starting point";
  else if (journey.destination.status !== 'selected') buttonLabel = "Select destination";
  else if (canAnalyze) buttonLabel = "Analyze Journey";

  return (
    <div className="flex-1 flex flex-col pointer-events-auto">
      <div className="w-full">
        <h2 className="text-xl font-bold mb-1">Where to?</h2>
        <p className="text-slate-400 text-sm mb-4">Search real places to analyze your journey.</p>

        <div className="space-y-3">
          <div>
            <div className="relative group">
              <div className="absolute left-3 top-3.5 w-3 h-3 rounded-full border-2 border-slate-500 z-10"></div>
              <PlaceAutocompleteInput 
                role="origin"
                placeholder="Search your starting location..."
                selectedLocation={journey.origin.status === 'selected' ? journey.origin : null}
                inputStatus={journey.origin.status || 'empty'}
                onPlaceTyping={(text) => {
                  if (text && journey.origin.status !== 'typing') {
                    dispatch({ type: 'UPDATE_SETUP', payload: { origin: { ...journey.origin, status: 'typing', inputText: text } } });
                  } else if (!text) {
                    handleClearLocation('origin');
                  }
                }}
                onPlaceSelected={(loc) => {
                  if (loc) {
                    dispatch({ type: 'UPDATE_SETUP', payload: { origin: loc } });
                  } else {
                    handleClearLocation('origin');
                  }
                }}
              />
              {journey.origin.status && journey.origin.status !== 'empty' && (
                <button 
                  onClick={() => handleClearLocation('origin')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white z-10 p-1"
                >
                  ✕
                </button>
              )}
            </div>
            {journey.origin.status === 'typing' && (
              <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 px-1">
                <span className="text-amber-500">⚠</span> Select a place from the suggestions
              </div>
            )}
            {journey.origin.status === 'selected' && journey.origin.source === 'geolocation' && journey.origin.address && (
              <div className="mt-1 ml-9 text-xs text-slate-400 font-medium tracking-wide">
                {journey.origin.address}
              </div>
            )}
            {journey.origin.status === 'error' && (
              <div className="mt-1 ml-9 text-xs text-amber-500 font-medium flex items-center gap-1">
                <span className="text-[10px]">⚠️</span> Select a place from the suggestions
              </div>
            )}
            {journey.origin.status === 'selected' && (
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 px-1">
                ✓ Location selected
              </div>
            )}
          </div>

          <div className="flex justify-end -mt-1 mb-1 pr-1">
             <button 
               onClick={requestGeolocation} 
               disabled={locating}
               className={`text-[11px] font-medium px-2 py-1.5 rounded transition-colors ${
                 locating 
                   ? 'text-slate-400 bg-slate-800 animate-pulse' 
                   : journey.origin.source === 'geolocation'
                     ? 'text-emerald-400 hover:text-emerald-300 bg-emerald-900/20'
                     : 'text-blue-400 hover:text-blue-300 bg-blue-900/20'
               }`}
             >
               {locating ? '◌ Locating you...' : journey.origin.source === 'geolocation' ? '✓ Refresh location' : '📍 Use current location'}
             </button>
          </div>

          <div>
            <div className="relative group">
              <div className="absolute left-3 top-3.5 w-3 h-3 bg-blue-500 rounded-sm z-10"></div>
              <PlaceAutocompleteInput 
                role="destination"
                placeholder="Search your destination..."
                selectedLocation={journey.destination.status === 'selected' ? journey.destination : null}
                inputStatus={journey.destination.status || 'empty'}
                onPlaceTyping={(text) => {
                  if (text && journey.destination.status !== 'typing') {
                    dispatch({ type: 'UPDATE_SETUP', payload: { destination: { ...journey.destination, status: 'typing', inputText: text } } });
                  } else if (!text) {
                    handleClearLocation('destination');
                  }
                }}
                onPlaceSelected={(loc) => {
                  if (loc) {
                    dispatch({ type: 'UPDATE_SETUP', payload: { destination: loc } });
                  } else {
                    handleClearLocation('destination');
                  }
                }}
              />
              {journey.destination.status && journey.destination.status !== 'empty' && (
                <button 
                  onClick={() => handleClearLocation('destination')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white z-10 p-1"
                >
                  ✕
                </button>
              )}
            </div>
            {journey.destination.status === 'typing' && (
              <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 px-1">
                <span className="text-amber-500">⚠</span> Select a place from the suggestions
              </div>
            )}
            {journey.destination.status === 'selected' && (
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 px-1">
                ✓ Location selected
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Mode</label>
              <select 
                value={journey.travelMode} 
                onChange={(e) => dispatch({ type: 'UPDATE_SETUP', payload: { travelMode: e.target.value as any } })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none appearance-none"
              >
                <option value="TWO_WHEELER">🛵 Two-wheeler</option>
                <option value="WALKING">🚶 Walking</option>
                <option value="CYCLING">🚲 Cycling</option>
                <option value="DRIVING">🚗 Driving</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Priority</label>
              <select 
                value={journey.preference} 
                onChange={(e) => dispatch({ type: 'UPDATE_SETUP', payload: { preference: e.target.value as any } })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none appearance-none"
              >
                <option value="BALANCED">⚖️ Balanced</option>
                <option value="FASTEST">⚡ Fastest</option>
                <option value="COMFORT">🛋️ Comfort</option>
                <option value="CAUTIOUS">🛡️ Cautious</option>
              </select>
            </div>
          </div>

          {journey.travelMode === 'TWO_WHEELER' && (
            <div className="text-[10px] text-amber-500/80 bg-amber-500/10 px-2 py-1.5 rounded text-center">
              Two-wheeler routes are provided in beta and may have limited coverage.
            </div>
          )}

          <button 
            onClick={analyzeJourney}
            disabled={!canAnalyze || analyzing}
            className={`w-full mt-4 font-semibold py-3 rounded-xl flex items-center justify-center text-sm transition-all
              ${!canAnalyze 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : analyzing 
                  ? 'bg-blue-900/30 border border-blue-800 text-blue-400 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
              }`}
          >
            {buttonLabel}
          </button>
          
          <div className="text-center mt-4">
            <button 
              onClick={() => {
                if (onPlayDemo) onPlayDemo();
              }}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 mx-auto"
            >
              ▶ PLAY DEMO SCENARIO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
