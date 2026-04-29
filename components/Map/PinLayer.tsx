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

export const CATEGORY_COLORS: Record<string, string> = {
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
        const size = isSelected ? 52 : 44;
        
        return (
          <Marker
            key={pin.id}
            longitude={pin.coordinates[1]}
            latitude={pin.coordinates[0]}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onPinClick(pin);
            }}
          >
            <div 
              className="group relative flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                filter: isSelected ? 'drop-shadow(0 12px 16px rgba(0,0,0,0.4))' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))',
                transform: isSelected ? 'scale(1.1) translateY(-6px)' : 'scale(1)',
                zIndex: isSelected ? 50 : 1,
              }}
            >
              {/* Ground Shadow Base */}
              <div 
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/20 rounded-[100%] blur-[2px] transition-all duration-300 ${isSelected ? 'scale-150 opacity-40' : 'scale-100 opacity-20'}`}
              />

              {/* Modern Teardrop Pin Shape */}
              <svg 
                width={size} 
                height={size} 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-200 group-hover:scale-110"
              >
                <path 
                  d="M12 21.7C16.5 17.5 20 13.5 20 9.2C20 4.7 16.4 1.1 12 1.1C7.6 1.1 4 4.7 4 9.2C4 13.5 7.5 17.5 12 21.7Z" 
                  fill={color} 
                  stroke="white" 
                  strokeWidth="2.2"
                  className="transition-all duration-200"
                />
                <circle cx="12" cy="9.2" r="4.2" fill="white" className="opacity-95" />
                <circle cx="12" cy="9.2" r="2.2" fill={color} />
              </svg>
              
              {/* Interactive Halo / Pulse */}
              {isSelected && (
                <div 
                  className="absolute inset-0 rounded-full animate-ping bg-white/40 -z-10"
                  style={{ animationDuration: '2s' }}
                />
              )}

              {/* Hover Glow */}
              <div 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-200 -z-20 scale-150"
                style={{ backgroundColor: color }}
              />
            </div>
          </Marker>
        );
      })}
    </>
  );
}
