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
  const inputRef = useRef<HTMLInputElement>(null);
  const map = useMap();
  const places = useMapsLibrary('places');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  // Initialize traditional Autocomplete widget
  useEffect(() => {
    if (!places || !inputRef.current) return;

    const widget = new places.Autocomplete(inputRef.current, {
      fields: ['place_id', 'geometry', 'name', 'formatted_address'],
    });

    setAutocomplete(widget);

    console.log(`[Weather Shield] ${role.toUpperCase()}_AUTOCOMPLETE_READY`);

    return () => {
      // Cleanup is mostly handled by Google Maps API, but we can clear listeners
      google.maps.event.clearInstanceListeners(widget);
    };
  }, [places, role]);

  // Handle syncing of external values into the widget (e.g. Geolocation)
  useEffect(() => {
    if (inputRef.current && selectedLocation) {
      if (selectedLocation.source === 'geolocation') {
        inputRef.current.value = '📍 Your location';
      } else if (selectedLocation.name && selectedLocation.name !== 'Your location') {
        inputRef.current.value = selectedLocation.name;
      }
    } else if (inputRef.current && !selectedLocation) {
      inputRef.current.value = '';
    }
  }, [selectedLocation]);

  // Sync locationBias with map center to improve local search relevance
  useEffect(() => {
    if (!map || !autocomplete) return;

    const listener = map.addListener('idle', () => {
      const center = map.getCenter();
      if (center) {
        const circle = new google.maps.Circle({ center: center, radius: 50000 });
        autocomplete.setBounds(circle.getBounds() as google.maps.LatLngBounds);
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, autocomplete]);

  // Event Listeners
  useEffect(() => {
    if (!autocomplete) return;

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (!place.geometry || !place.geometry.location) {
        if (onPlaceError) onPlaceError('The selected place does not have a usable location.');
        onPlaceSelected(null);
        return;
      }

      console.log(`[Weather Shield] ${role.toUpperCase()}_SELECTED`, place.name);

      const loc: LocationPoint = {
        placeId: place.place_id,
        name: place.name || place.formatted_address || 'Selected location',
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        source: 'places',
        status: 'selected'
      };

      onPlaceSelected(loc);

      if (place.geometry.viewport && map) {
        map.fitBounds(place.geometry.viewport);
      } else if (map) {
        map.setCenter(place.geometry.location);
        map.setZoom(15);
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [autocomplete, map, onPlaceError, onPlaceSelected, role]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (onPlaceTyping) onPlaceTyping(value);
  };

  return (
    <div className="w-full relative" data-role={`${role}-autocomplete`}>
      <input 
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        onChange={handleInput}
        className="w-full rounded-lg border border-slate-700 bg-slate-900/80 text-white px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-inner"
      />
    </div>
  );
}
