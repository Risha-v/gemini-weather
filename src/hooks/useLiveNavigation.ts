import { useEffect, useRef } from 'react';
import { useJourney } from '@/state/JourneyContext';
import { speakText } from '@/lib/speech';

// Calculate distance between two coordinates in meters (Haversine formula)
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

export function useLiveNavigation() {
  const { journey, dispatch } = useJourney();
  const watchIdRef = useRef<number | null>(null);
  const activeStepRef = useRef<number>(0);
  const lastSpokenStepRef = useRef<number | null>(null);

  // Sync ref with state when state changes externally (e.g. initial start)
  useEffect(() => {
    if (journey?.activeNavigationStepIndex !== undefined) {
      activeStepRef.current = journey.activeNavigationStepIndex;
    }
  }, [journey?.activeNavigationStepIndex]);

  useEffect(() => {
    if (!journey || journey.state !== 'NAVIGATING') {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    const selectedRoute = journey.routes.find(r => r.id === journey.selectedRouteId) || journey.routes[0];
    if (!selectedRoute) return;

    const legs = selectedRoute.legs || [];
    const steps = legs[0]?.steps || [];

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading } = position.coords;
        
        let currentActiveStep = activeStepRef.current;
        
        // Check if we reached or passed the end of the current step
        if (currentActiveStep < steps.length) {
          const step = steps[currentActiveStep];
          const endLoc = step.endLocation?.latLng;
          if (endLoc) {
            const distToEnd = getDistanceMeters(latitude, longitude, endLoc.latitude, endLoc.longitude);
            // If within 50 meters of the step's end, advance to next step
            if (distToEnd < 50) {
              currentActiveStep++;
              activeStepRef.current = currentActiveStep;
            }
          }
        }

        // Trigger voice for a new step if we haven't already
        if (currentActiveStep !== lastSpokenStepRef.current && currentActiveStep < steps.length) {
          const step = steps[currentActiveStep];
          const instructionHtml = step.navigationInstruction?.instructions || "";
          const textContent = instructionHtml.replace(/<[^>]*>?/gm, ''); // strip HTML
          
          if (textContent) {
            speakText(`Upcoming: ${textContent}`);
            lastSpokenStepRef.current = currentActiveStep;
          }
        }

        dispatch({
          type: 'UPDATE_LIVE_LOCATION',
          payload: {
            location: {
              lat: latitude,
              lng: longitude,
              speed: speed || undefined,
              heading: heading || undefined,
              timestamp: position.timestamp
            },
            activeStepIndex: currentActiveStep
          }
        });
      },
      (error) => {
        console.error("Live navigation GPS error:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [journey?.state, journey?.selectedRouteId, dispatch]); 
}
