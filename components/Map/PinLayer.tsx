'use client';

import { Marker } from 'react-map-gl/mapbox';
import { Pin, Category } from '@/types/campus';
import { useMemo } from 'react';

interface PinLayerProps {
  pins: Pin[];
  activeCategory: Category;
  onPinClick: (pin: Pin) => void;
  selectedPinId?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  study: '#4ade80',              // green
  hangout: '#facc15',            // yellow
  food: '#fb923c',               // orange
  library: '#a855f7',            // purple
  restroom: '#3b82f6',           // blue
  office: '#ef4444',             // red
  sports_and_recreation: '#f43f5e', // rose
  student_services: '#06b6d4',   // cyan
};

export default function PinLayer({ 
  pins, 
  activeCategory, 
  onPinClick,
  selectedPinId 
}: PinLayerProps) {
  
  const filteredPins = useMemo(() => {
    return pins.filter(pin => {
      if (activeCategory === 'all') return true;
      return pin.category.includes(activeCategory);
    });
  }, [pins, activeCategory]);

  return (
    <>
      {filteredPins.map((pin) => {
        const isSelected = pin.id === selectedPinId;
        const primaryCategory = pin.category[0] || 'office';
        const color = CATEGORY_COLORS[primaryCategory] || '#94a3b8';
        const size = isSelected ? 44 : 36;
        
        return (
          <Marker
            key={pin.id}
            longitude={pin.coordinates[1]}
            latitude={pin.coordinates[0]}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onPinClick(pin);
            }}
          >
            <div 
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                border: '3px solid white',
                borderRadius: '50%',
                boxShadow: isSelected 
                  ? '0 0 0 4px rgba(255,255,255,0.4), 0 8px 24px rgba(0,0,0,0.3)' 
                  : '0 4px 12px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isSelected ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: 'white',
                borderRadius: '50%',
              }} />
            </div>
          </Marker>
        );
      })}
    </>
  );
}
