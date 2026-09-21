"use client";

import React, { useState } from 'react';
import { Layers, CloudRain, Wind, Gauge, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapLayersControlProps {
  layers: { traffic: boolean; rain: boolean; pressure: boolean; wind: boolean };
  setLayers: React.Dispatch<React.SetStateAction<{ traffic: boolean; rain: boolean; pressure: boolean; wind: boolean }>>;
}

export function MapLayersControl({ layers, setLayers }: MapLayersControlProps) {
  const [open, setOpen] = useState(false);

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="absolute top-4 right-4 z-30 pointer-events-auto">
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl flex flex-col items-end">
        
        <button 
          onClick={() => setOpen(!open)}
          className="p-3 hover:bg-slate-800 transition-colors flex items-center gap-2 rounded-xl"
        >
          <Layers className="w-5 h-5 text-slate-300" />
          {open && <span className="text-sm font-bold text-slate-300 pr-2">MAP LAYERS</span>}
        </button>

        {open && (
          <div className="w-48 p-2 border-t border-slate-700">
            <LayerToggle icon={<Car className="w-4 h-4"/>} label="Traffic" active={layers.traffic} onClick={() => toggleLayer('traffic')} />
            <div className="h-px bg-slate-800 my-1 mx-2" />
            <LayerToggle icon={<CloudRain className="w-4 h-4"/>} label="Rain" active={layers.rain} onClick={() => toggleLayer('rain')} />
            <LayerToggle icon={<Wind className="w-4 h-4"/>} label="Wind" active={layers.wind} onClick={() => toggleLayer('wind')} />
            <LayerToggle icon={<Gauge className="w-4 h-4"/>} label="Pressure" active={layers.pressure} onClick={() => toggleLayer('pressure')} />
          </div>
        )}
      </div>
    </div>
  );
}

function LayerToggle({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left",
        active ? "bg-blue-600/20 text-blue-400" : "hover:bg-slate-800 text-slate-400"
      )}
    >
      <div className={cn("p-1 rounded", active ? "bg-blue-600/40 text-blue-300" : "bg-slate-800 text-slate-500")}>
        {icon}
      </div>
      <span className="flex-1 font-medium">{label}</span>
      <div className={cn("w-3 h-3 rounded-full border border-slate-600", active ? "bg-blue-500 border-blue-500" : "bg-transparent")} />
    </button>
  );
}
