'use client';

import { useState } from 'react';

export interface MapStyleOption {
  id: string;
  label: string;
  url: string;
}

export const MAP_STYLES: MapStyleOption[] = [
  { id: 'custom-light', label: 'Light', url: 'mapbox://styles/gpesana/cmohc84g1001f01rech0p3ceu' },
  { id: 'custom-dark', label: 'Dark', url: 'mapbox://styles/gpesana/cmohc4mc7007n01r40ewxeawu' },
  { id: 'streets', label: 'Streets', url: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'outdoors', label: 'Outdoors', url: 'mapbox://styles/mapbox/outdoors-v12' },
  { id: 'satellite', label: 'Satellite', url: 'mapbox://styles/mapbox/satellite-v9' },
  { id: 'satellite-streets', label: 'Hybrid', url: 'mapbox://styles/mapbox/satellite-streets-v12' },
];

interface MapStyleSelectorProps {
  currentStyle: string;
  onStyleChange: (styleUrl: string) => void;
}

export default function MapStyleSelector({ currentStyle, onStyleChange }: MapStyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-2">
      {/* Expanded Menu */}
      {isOpen && (
        <div className="mb-2 p-2 bg-panel-bg backdrop-blur-xl rounded-2xl shadow-2xl border border-panel-border min-w-[140px] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col gap-1">
            {MAP_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => {
                  onStyleChange(style.url);
                  setIsOpen(false);
                }}
                className={`
                  px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-left transition-all
                  ${currentStyle === style.url 
                    ? 'bg-foreground text-background shadow-lg' 
                    : 'text-foreground/50 hover:text-foreground hover:bg-foreground/5'}
                `}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-4 bg-panel-bg backdrop-blur-xl rounded-full shadow-2xl border border-panel-border transition-all active:scale-90 group
          ${isOpen ? 'bg-foreground border-foreground/10' : 'hover:border-foreground/20'}
        `}
        aria-label="Change map view"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={isOpen ? 'text-background' : 'text-foreground/60'}
        >
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      </button>
    </div>
  );
}
