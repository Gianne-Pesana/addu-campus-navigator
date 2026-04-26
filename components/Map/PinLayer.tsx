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
  study: '#10b981',              // Green
  hangout: '#f59e0b',            // Amber/Yellow
  food: '#f97316',               // Orange
  library: '#8b5cf6',            // Purple
  restroom: '#3b82f6',           // Blue
  office: '#ef4444',             // Red
  sports_and_recreation: '#f43f5e', // Rose
  student_services: '#06b6d4',   // Cyan
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
        const color = CATEGORY_COLORS[primaryCategory] || '#64748b';
        
        // Pin Size
        const size = isSelected ? 48 : 40;
        
        return (
          <Marker
            key={pin.id}
            longitude={pin.coordinates[1]}
            latitude={pin.coordinates[0]}
            anchor="bottom" // Anchor to bottom for a proper map pin feel
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onPinClick(pin);
            }}
          >
            <div 
              style={{
                width: `${size}px`,
                height: `${size}px`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                filter: isSelected ? 'drop-shadow(0 12px 24px rgba(0,0,0,0.3))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: isSelected ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
              }}
            >
              {/* Modern Teardrop Pin Shape */}
              <svg 
                width={size} 
                height={size} 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 21C16 17 20 13.4183 20 9C20 4.58172 16.4183 1 12 1C7.58172 1 4 4.58172 4 9C4 13.4183 8 17 12 21Z" 
                  fill={color} 
                  stroke="white" 
                  strokeWidth="2"
                />
                <circle cx="12" cy="9" r="3.5" fill="white" />
              </svg>
              
              {/* Subtle Pulse for selected pin */}
              {isSelected && (
                <div className="absolute inset-0 rounded-full animate-ping bg-zinc-900/5 -z-10" />
              )}
            </div>
          </Marker>
        );
      })}
    </>
  );
}
