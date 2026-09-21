"use client";

import React, { useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export default function GooglePlacesDiagnostic() {
  const containerRef = useRef<HTMLDivElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !containerRef.current) return;

    const autocomplete = new places.PlaceAutocompleteElement();
    autocomplete.placeholder = "Search for a place...";

    const handleSelect = async (event: google.maps.places.PlacePredictionSelectEvent) => {
      const place = event.placePrediction.toPlace();

      await place.fetchFields({
        fields: ["id", "displayName", "formattedAddress", "location"],
      });

      console.log("[Weather Shield] PLACE_SELECTED", {
        name: place.displayName,
        address: place.formattedAddress,
        location: place.location,
      });
    };

    autocomplete.addEventListener("gmp-select", handleSelect);

    containerRef.current.replaceChildren(autocomplete);

    return () => {
      autocomplete.removeEventListener("gmp-select", handleSelect);
      autocomplete.remove();
    };
  }, [places]);

  if (!places) {
    return <div className="p-8 text-white">Loading Places library...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Google Places Diagnostic</h1>
      <div className="mb-8 p-4 bg-slate-800 rounded-lg">
        <h2 className="text-xl mb-2">Test Autocomplete Here:</h2>
        <div ref={containerRef} className="w-[400px] overflow-visible bg-white text-black p-2 rounded" />
      </div>
    </div>
  );
}
