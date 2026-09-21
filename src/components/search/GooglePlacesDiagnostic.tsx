"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary, Map } from '@vis.gl/react-google-maps';

export default function GooglePlacesDiagnostic() {
  const containerRef = useRef<HTMLDivElement>(null);
  const places = useMapsLibrary('places');
  const [autocompleteElement, setAutocompleteElement] = useState<any>(null);

  useEffect(() => {
    if (!places || !containerRef.current) return;

    if (containerRef.current.hasChildNodes()) {
      containerRef.current.innerHTML = '';
    }

    const PlaceAutocompleteElement = (places as any).PlaceAutocompleteElement;
    if (!PlaceAutocompleteElement) {
      console.error("[Weather Shield] PlaceAutocompleteElement is not available!");
      return;
    }

    const autocomplete = new PlaceAutocompleteElement();
    containerRef.current.appendChild(autocomplete);
    setAutocompleteElement(autocomplete);
    console.log("[Weather Shield] PLACE_AUTOCOMPLETE_INITIALIZED");

    const handleSelect = async (event: any) => {
      const { placePrediction } = event;
      if (!placePrediction) return;

      console.log("[Weather Shield] RAW_PLACE_PREDICTION", placePrediction);

      try {
        const place = placePrediction.toPlace();
        await place.fetchFields({
          fields: ["id", "displayName", "formattedAddress", "location", "viewport"]
        });

        console.log("[Weather Shield] PLACE_SELECTED", {
          id: place.id,
          name: place.displayName,
          address: place.formattedAddress,
          location: place.location
        });
      } catch (e) {
        console.error("[Weather Shield] FETCH_FIELDS_ERROR", e);
      }
    };

    const handleError = (event: any) => {
      console.error("[Weather Shield] PLACE_AUTOCOMPLETE_ERROR", event);
    };

    autocomplete.addEventListener("gmp-select", handleSelect);
    autocomplete.addEventListener("gmp-error", handleError);

    return () => {
      autocomplete.removeEventListener("gmp-select", handleSelect);
      autocomplete.removeEventListener("gmp-error", handleError);
    };
  }, [places]);

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Google Places Diagnostic</h1>
      <div className="mb-8 p-4 bg-slate-800 rounded-lg">
        <h2 className="text-xl mb-2">Test Autocomplete Here:</h2>
        <div ref={containerRef} className="w-[400px] overflow-visible bg-white text-black p-2 rounded" />
      </div>
      
      <div className="flex-1 rounded-xl overflow-hidden">
        <Map
          defaultCenter={{ lat: 28.6139, lng: 77.2090 }}
          defaultZoom={10}
          mapId="diagnostic-map"
        />
      </div>
    </div>
  );
}
