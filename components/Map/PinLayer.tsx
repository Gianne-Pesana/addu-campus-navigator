'use client';

import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Pin, Category } from '@/types/campus';

interface PinLayerProps {
  pins: Pin[];
  activeCategory: Category;
  onPinClick: (pin: Pin) => void;
  selectedPinId?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  study: '#4ade80',    // green
  hangout: '#facc15',  // yellow
  food: '#fb923c',     // orange
  library: '#a855f7',  // purple
  restroom: '#3b82f6', // blue
  office: '#ef4444',   // red
};

const createPinIcon = (category: string, isSelected: boolean) => {
  const color = CATEGORY_COLORS[category] || '#94a3b8';
  const size = isSelected ? 40 : 32;
  
  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease-out;
        transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export default function PinLayer({ 
  pins, 
  activeCategory, 
  onPinClick,
  selectedPinId 
}: PinLayerProps) {
  const map = useMap();

  const filteredPins = pins.filter(pin => {
    if (activeCategory === 'all') return true;
    return pin.category.includes(activeCategory);
  });

  return (
    <>
      {filteredPins.map((pin) => {
        const isSelected = pin.id === selectedPinId;
        const primaryCategory = pin.category[0] || 'office';
        
        return (
          <Marker
            key={pin.id}
            position={pin.coordinates}
            icon={createPinIcon(primaryCategory, isSelected)}
            eventHandlers={{
              click: () => {
                onPinClick(pin);
                map.setView(pin.coordinates, Math.max(map.getZoom(), 19), {
                  animate: true,
                });
              },
            }}
          />
        );
      })}
    </>
  );
}
