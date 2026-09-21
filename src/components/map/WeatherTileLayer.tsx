"use client";

import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface WeatherTileLayerProps {
  field: string;
  timestamp?: string; // ISO8601 or similar if needed by tomorrow API
  opacity?: number;
  visible?: boolean;
}

export function WeatherTileLayer({ field, timestamp = 'now', opacity = 0.6, visible = true }: WeatherTileLayerProps) {
  const map = useMap();
  const layerRef = useRef<google.maps.ImageMapType | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!layerRef.current) {
      layerRef.current = new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
          const apiKey = process.env.NEXT_PUBLIC_APP_MODE === 'demo' ? '' : process.env.TOMORROW_API_KEY || 'DEMO_KEY';
          // Since TOMORROW_API_KEY is not exposed to the browser directly for security, we should ideally fetch tiles via a proxy,
          // but for the sake of the prototype and if the user configured it, we can proxy it or use a demo url.
          // Wait, the instructions say to keep TOMORROW_API_KEY server-side only. 
          // So we should proxy the tile request through our Next.js API!
          return `/api/weather/tile?z=${zoom}&x=${coord.x}&y=${coord.y}&field=${field}&time=${timestamp}`;
        },
        tileSize: new google.maps.Size(256, 256),
        maxZoom: 12,
        minZoom: 0,
        name: 'Weather Layer',
        opacity: opacity,
      });
    } else {
      // If we need to update URL, we have to recreate or force redraw
      layerRef.current.setOpacity(opacity);
    }

    if (visible) {
      if (!map.overlayMapTypes.getArray().includes(layerRef.current)) {
        map.overlayMapTypes.push(layerRef.current);
      }
    } else {
      const index = map.overlayMapTypes.getArray().indexOf(layerRef.current);
      if (index !== -1) {
        map.overlayMapTypes.removeAt(index);
      }
    }

    return () => {
      if (map && layerRef.current) {
        const idx = map.overlayMapTypes.getArray().indexOf(layerRef.current);
        if (idx !== -1) map.overlayMapTypes.removeAt(idx);
      }
    };
  }, [map, field, timestamp, visible, opacity]);

  return null;
}
