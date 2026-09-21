"use client";

import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface PolylineProps {
  path: { lat: number; lng: number }[];
  options?: google.maps.PolylineOptions;
  onClick?: () => void;
}

export function Polyline({ path, options, onClick }: PolylineProps) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const listenerRef = useRef<google.maps.MapsEventListener | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({
        path,
        map,
        ...options
      });
    } else {
      polylineRef.current.setPath(path);
      if (options) {
        polylineRef.current.setOptions(options);
      }
    }

    // Handle click listener
    if (listenerRef.current) {
      listenerRef.current.remove();
      listenerRef.current = null;
    }
    if (onClick && polylineRef.current) {
      listenerRef.current = polylineRef.current.addListener('click', onClick);
    }
  }, [map, path, options, onClick]);

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        listenerRef.current.remove();
      }
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, []);

  return null;
}
