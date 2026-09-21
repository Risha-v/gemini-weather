"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useJourney } from '@/state/JourneyContext';
import { Map, AdvancedMarker, useMap, InfoWindow, MapMouseEvent } from '@vis.gl/react-google-maps';
import { cn } from '@/lib/utils';
import { WeatherTileLayer } from '@/components/map/WeatherTileLayer';
import { Polyline } from '@/components/map/Polyline';
import { MapLayersControl } from './MapLayersControl';
import FloatingWeatherWidget from './FloatingWeatherWidget';

type MapCoordinate = {
  lat: number;
  lng: number;
};

function isValidMapCoordinate(point: unknown): point is MapCoordinate {
  if (!point || typeof point !== 'object') return false;
  const p = point as any;
  return typeof p.lat === 'number' && Number.isFinite(p.lat) && typeof p.lng === 'number' && Number.isFinite(p.lng);
}

export default function MapWorkspace() {
  const { journey, dispatch } = useJourney();
  const map = useMap();
  const [activeRouteId, setActiveRouteId] = React.useState<string | null>(null);

  // Auto-pan map to live location when navigating
  React.useEffect(() => {
    if (journey.state === 'NAVIGATING' && journey.liveLocation && map) {
      map.panTo(journey.liveLocation);
    }
  }, [journey.liveLocation, journey.state, map]);

  const [layers, setLayers] = useState<any>({ traffic: true, rain: false, wind: false, pressure: false });
  const [clickedPos, setClickedPos] = useState<MapCoordinate | null>(null);
  
  if (!journey) return null;

  const validOrigin = isValidMapCoordinate(journey.origin) ? { lat: journey.origin.lat, lng: journey.origin.lng } : null;
  const destLat = Number(journey.destination.lat);
  const destLng = Number(journey.destination.lng);
  const validDestination = (destLat && destLng && !isNaN(destLat) && !isNaN(destLng)) 
    ? { lat: destLat, lng: destLng } 
    : null;

  const selectedRoute = journey.routes.find((r: any) => r.id === journey.selectedRouteId) || journey.routes[0];
  const alternativeRoutes = journey.routes.filter((r: any) => r.id !== selectedRoute?.id);

  const rawRoutePath = selectedRoute?.path || [];
  const routePath = rawRoutePath
    .map((p: any) => ({ lat: p[0], lng: p[1] }))
    .filter(isValidMapCoordinate);

  useEffect(() => {
    if (rawRoutePath.length > 0) {
      console.log(`[Weather Shield] ROUTE_NORMALIZATION\nreceived: ${rawRoutePath.length}\nvalid: ${routePath.length}\ndiscarded: ${rawRoutePath.length - routePath.length}`);
    }
  }, [rawRoutePath.length, routePath.length]);

  const validIncidents = (journey.incidents || []).filter((inc: any) => {
    if (!inc || !inc.location) return false;
    const lat = typeof inc.location.lat === 'number' ? inc.location.lat : inc.location[0];
    const lng = typeof inc.location.lng === 'number' ? inc.location.lng : inc.location[1];
    return isValidMapCoordinate({ lat, lng });
  }).map((inc: any) => {
    const lat = typeof inc.location.lat === 'number' ? inc.location.lat : inc.location[0];
    const lng = typeof inc.location.lng === 'number' ? inc.location.lng : inc.location[1];
    return { ...inc, lat, lng };
  });

  const validSafeStops = (journey.safeStops || []).filter((stop: any) => {
    if (!stop || !stop.location) return false;
    const lat = typeof stop.location.lat === 'number' ? stop.location.lat : stop.location[0];
    const lng = typeof stop.location.lng === 'number' ? stop.location.lng : stop.location[1];
    return isValidMapCoordinate({ lat, lng });
  }).map((stop: any) => {
    const lat = typeof stop.location.lat === 'number' ? stop.location.lat : stop.location[0];
    const lng = typeof stop.location.lng === 'number' ? stop.location.lng : stop.location[1];
    return { ...stop, lat, lng };
  });

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center">
      <FloatingWeatherWidget />
      
      <Map
        style={{ width: '100%', height: '100%' }}
        mapId="DEMO_MAP_ID"
        defaultZoom={5}
        defaultCenter={{ lat: 20, lng: 78 }} // Center of India default
        disableDefaultUI={true}
        gestureHandling="greedy"
        onContextmenu={(e: MapMouseEvent) => {
          if (e.detail.latLng) {
            setClickedPos({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
          }
        }}
        onClick={() => setClickedPos(null)}
      >
        <MapBoundsController 
          origin={validOrigin} 
          destination={validDestination} 
          routePath={routePath} 
        />

        {layers.traffic && <TrafficLayerRenderer />}
        {layers.rain && <WeatherTileLayer field="precipitationProbability" />}
        {layers.wind && <WeatherTileLayer field="windSpeed" />}
        {layers.pressure && <WeatherTileLayer field="pressureSeaLevel" />}

        {/* Alternative Routes (clickable to select) */}
        {alternativeRoutes.map((altRoute: any) => {
          const altPath = (altRoute.path || [])
            .map((p: any) => ({ lat: p[0], lng: p[1] }))
            .filter(isValidMapCoordinate);
            
          if (altPath.length === 0) return null;
          
          return (
            <Polyline 
              key={`alt-${altRoute.id}`}
              path={altPath}
              onClick={() => dispatch({ type: 'SELECT_ROUTE', payload: altRoute.id })}
              options={{
                strokeColor: "#64748b",
                strokeWeight: 5,
                strokeOpacity: 0.5,
                zIndex: 1,
                clickable: true
              }}
            />
          );
        })}

        {/* Selected Route */}
        {routePath.length > 0 && (
          <Polyline 
            key={`selected-${selectedRoute.id}`}
            path={routePath}
            options={{
              strokeColor: '#4285F4',
              strokeWeight: 6,
              strokeOpacity: 1.0,
              zIndex: 2
            }}
          />
        )}

        {/* Geolocation pulsing marker (Live GPS or Initial Setup) */}
        {((validOrigin && journey.origin.source === 'geolocation') || journey.liveLocation) && (
          <AdvancedMarker position={journey.liveLocation || validOrigin}>
            <div className="relative group cursor-pointer -translate-y-1/2">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-sm opacity-40 animate-pulse w-8 h-8 -left-2 -top-2" />
              <div className="relative bg-blue-500 border-2 border-white w-4 h-4 rounded-full shadow-lg" />
              <div className="absolute top-full mt-1 bg-slate-900 border border-slate-700 text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                {journey.state === 'NAVIGATING' ? 'LIVE LOCATION' : 'CURRENT LOCATION'}
              </div>
            </div>
          </AdvancedMarker>
        )}

        {/* Normal Origin Marker */}
        {validOrigin && journey.origin.source !== 'geolocation' && !journey.liveLocation && (
          <AdvancedMarker position={validOrigin} />
        )}

        {/* Destination Marker */}
        {validDestination && (
          <AdvancedMarker position={validDestination} />
        )}

        {/* Emergency Mode Flood Marker */}
        {journey.state === 'EMERGENCY_MODE' && validIncidents.map((inc: any, i: number) => (
          <AdvancedMarker key={i} position={{ lat: inc.lat, lng: inc.lng }}>
            <div className="relative animate-bounce -translate-y-1/2">
                <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-red-400">
                  {inc.type}
                </div>
            </div>
          </AdvancedMarker>
        ))}

        {/* Safe Stop */}
        {journey.state === 'EMERGENCY_MODE' && validSafeStops.map((stop: any) => (
          <AdvancedMarker key={stop.id} position={{ lat: stop.lat, lng: stop.lng }}>
            <div className="relative group cursor-pointer animate-in zoom-in duration-500 -translate-y-1/2">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-md opacity-80 transition-opacity animate-pulse" />
              <div className="relative bg-green-900 border-2 border-green-500 px-4 py-2 rounded-full flex items-center justify-center shadow-xl">
                <span className="text-[10px] font-bold text-white tracking-wider">{stop.name}</span>
              </div>
            </div>
          </AdvancedMarker>
        ))}

        {/* Map Click InfoWindow */}
        {clickedPos && (
          <InfoWindow position={clickedPos} onCloseClick={() => setClickedPos(null)}>
            <div className="p-2 flex flex-col gap-2 min-w-[120px]">
              <div className="text-sm font-bold text-slate-800 text-center mb-1">Set this location as:</div>
              <button 
                onClick={() => {
                  dispatch({
                    type: 'UPDATE_SETUP',
                    payload: {
                      origin: {
                        lat: clickedPos.lat, 
                        lng: clickedPos.lng,
                        name: 'Selected on map',
                        source: 'map-click',
                        status: 'selected'
                      }
                    }
                  });
                  setClickedPos(null);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1.5 px-3 rounded text-xs transition-colors"
              >
                Start
              </button>
              <button 
                onClick={() => {
                  dispatch({
                    type: 'UPDATE_SETUP',
                    payload: {
                      destination: {
                        lat: clickedPos.lat, 
                        lng: clickedPos.lng,
                        name: 'Selected on map',
                        source: 'map-click',
                        status: 'selected'
                      }
                    }
                  });
                  setClickedPos(null);
                }}
                className="bg-red-500 hover:bg-red-400 text-white font-semibold py-1.5 px-3 rounded text-xs transition-colors"
              >
                Destination
              </button>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Recenter button */}
      {journey.origin.source === 'geolocation' && validOrigin && (
        <button
          onClick={() => {
            const mapInstance = (window as any).googleMapInstance;
            if (mapInstance) {
              mapInstance.panTo(validOrigin);
              mapInstance.setZoom(15);
            }
          }}
          className="absolute right-4 bottom-24 bg-slate-900 border border-slate-700 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-800 transition-colors z-10"
          title="Center on my location"
        >
          ◎
        </button>
      )}

      <MapLayersControl layers={layers} setLayers={setLayers} />
    </div>
  );
}

function MapBoundsController({ origin, destination, routePath }: { origin: MapCoordinate | null, destination: MapCoordinate | null, routePath: MapCoordinate[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    
    // Stash instance for the center button
    (window as any).googleMapInstance = map;

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    if (origin) {
      bounds.extend(origin);
      hasPoints = true;
    }
    
    if (destination) {
      bounds.extend(destination);
      hasPoints = true;
    }

    if (routePath && routePath.length > 0) {
      routePath.forEach((p) => {
        bounds.extend(p);
      });
      hasPoints = true;
    }

    if (hasPoints) {
      if (routePath.length === 0 && origin && !destination) {
        map.panTo(origin);
        map.setZoom(15);
      } else {
        map.fitBounds(bounds, { top: 50, bottom: 250, left: 50, right: 50 });
      }
    }
  }, [map, origin, destination, routePath]);

  return null;
}

function TrafficLayerRenderer() {
  const map = useMap();
  const layerRef = useRef<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map) return;
    
    if (!layerRef.current) {
      layerRef.current = new google.maps.TrafficLayer();
    }
    
    layerRef.current.setMap(map);

    return () => {
      if (layerRef.current) {
        layerRef.current.setMap(null);
      }
    };
  }, [map]);

  return null;
}
