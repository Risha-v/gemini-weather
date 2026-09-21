"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { LocationPoint } from '@/domain/journey.types';

type PlaceAutocompleteInputProps = {
  role: "origin" | "destination";
  selectedLocation: LocationPoint | null;
  inputStatus: "empty" | "typing" | "selected" | "error";
  onPlaceSelected: (location: LocationPoint | null) => void;
  onPlaceTyping?: (text: string) => void;
  onPlaceError?: (error: string) => void;
  placeholder: string;
};

export function PlaceAutocompleteInput({
  role,
  selectedLocation,
  inputStatus,
  onPlaceSelected,
  onPlaceTyping,
  onPlaceError,
  placeholder
}: PlaceAutocompleteInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const map = useMap();
  const places = useMapsLibrary('places');
  const [autocompleteElement, setAutocompleteElement] = useState<any>(null);

  // Initialize the singleton autocomplete element
  useEffect(() => {
    if (!places || !containerRef.current) return;

    // Clear any existing children to prevent StrictMode duplicates
    if (containerRef.current.hasChildNodes()) {
      containerRef.current.innerHTML = '';
    }

    const el = new (places as any).PlaceAutocompleteElement({
      requestedLanguage: 'en',
    });

    try { el.placeholder = placeholder; } catch (e) {}

    containerRef.current.appendChild(el);
    setAutocompleteElement(el);

    console.log(`[Weather Shield] ${role.toUpperCase()}_AUTOCOMPLETE_READY`);

    return () => {
      if (containerRef.current && el) {
        try {
          containerRef.current.removeChild(el);
        } catch (e) {}
      }
    };
  }, [places, placeholder, role]);

  // Handle syncing of external values into the widget (e.g. Geolocation)
  useEffect(() => {
    if (autocompleteElement && selectedLocation) {
      if (selectedLocation.source === 'geolocation') {
        autocompleteElement.value = '📍 Your location';
      } else if (selectedLocation.name && selectedLocation.name !== 'Your location') {
        autocompleteElement.value = selectedLocation.name;
      }
    } else if (autocompleteElement && !selectedLocation) {
      autocompleteElement.value = '';
    }
  }, [autocompleteElement, selectedLocation]);

  // Sync locationBias with map center to improve local search relevance
  useEffect(() => {
    if (!map || !autocompleteElement) return;

    // Use map idle event to update bias without thrashing during drag
    const listener = map.addListener('idle', () => {
      const center = map.getCenter();
      if (center) {
        autocompleteElement.locationBias = {
          center: center,
          radius: 50000 // 50km radius for local biasing
        };
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, autocompleteElement]);

  // Event Listeners
  useEffect(() => {
    if (!autocompleteElement) return;

    const handlePlaceSelected = async (event: any) => {
      const { placePrediction } = event;
      
      if (!placePrediction) {
        onPlaceSelected(null);
        return;
      }

      try {
        const place = placePrediction.toPlace();
        await place.fetchFields({
          fields: ['id', 'displayName', 'formattedAddress', 'location', 'viewport']
        });

        if (!place.location) {
          if (onPlaceError) onPlaceError('The selected place does not have a usable location.');
          return;
        }

        console.log(`[Weather Shield] ${role.toUpperCase()}_SELECTED`, place.toJSON?.() || {
          id: place.id,
          name: place.displayName,
          address: place.formattedAddress,
          location: place.location
        });

        const loc: LocationPoint = {
          placeId: place.id || undefined,
          name: place.displayName || place.formattedAddress || 'Selected location',
          address: place.formattedAddress || undefined,
          lat: place.location.lat(),
          lng: place.location.lng(),
          source: 'places',
          status: 'selected'
        };

        onPlaceSelected(loc);

        if (place.viewport && map) {
          map.fitBounds(place.viewport);
        } else if (map) {
          map.setCenter(place.location);
          map.setZoom(15);
        }
      } catch (e) {
        console.error(`[Weather Shield] ${role.toUpperCase()}_AUTOCOMPLETE_FIELD_ERROR`, e);
        if (onPlaceError) onPlaceError('Failed to retrieve location details.');
      }
    };

    const handleError = (event: any) => {
      console.error(`[Weather Shield] ${role.toUpperCase()}_AUTOCOMPLETE_ERROR`, event);
      if (onPlaceError) onPlaceError('Google location search is temporarily unavailable.');
    };

    const handleInput = (event: any) => {
      const value = event.target?.value || '';
      if (onPlaceTyping) onPlaceTyping(value);
    };

    autocompleteElement.addEventListener('gmp-select', handlePlaceSelected);
    autocompleteElement.addEventListener('gmp-error', handleError);
    autocompleteElement.addEventListener('input', handleInput);

    return () => {
      autocompleteElement.removeEventListener('gmp-select', handlePlaceSelected);
      autocompleteElement.removeEventListener('gmp-error', handleError);
      autocompleteElement.removeEventListener('input', handleInput);
    };
  }, [autocompleteElement, map, onPlaceError, onPlaceSelected, onPlaceTyping, role]);

  return (
    <div className="w-full relative" data-role={`${role}-autocomplete`}>
      <div 
        ref={containerRef}
        className="w-full overflow-visible rounded-lg border border-slate-800 focus-within:border-blue-500 transition-colors z-50"
        style={{
          '--gmp-place-autocomplete-background-color': '#0f172a',
          '--gmp-place-autocomplete-color': 'white',
          '--gmp-place-autocomplete-border': 'none',
          '--gmp-place-autocomplete-padding': '0px',
          colorScheme: 'dark'
        } as React.CSSProperties}
      />
    </div>
  );
}
