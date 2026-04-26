'use client';

import { Polygon } from 'react-leaflet';
import { Zone, Category } from '@/types/campus';

interface ZoneLayerProps {
  zones: Zone[];
  activeCategory: Category;
  onZoneClick: (zone: Zone) => void;
  selectedZoneId?: string;
}

const CATEGORY_COLORS: Record<Category, string> = {
  'Study Spots': 'var(--study-color)',
  'Restrooms (CR)': 'var(--restroom-color)',
  'Hangout Areas': 'var(--hangout-color)',
  'Food Areas': 'var(--food-color)',
  'Offices / Services': 'var(--office-color)',
};

export default function ZoneLayer({ 
  zones, 
  activeCategory, 
  onZoneClick,
  selectedZoneId 
}: ZoneLayerProps) {
  return (
    <>
      {zones.map((zone) => {
        const isActive = zone.category === activeCategory;
        const isSelected = zone.id === selectedZoneId;
        const color = CATEGORY_COLORS[zone.category];

        return (
          <Polygon
            key={zone.id}
            positions={zone.coordinates}
            pathOptions={{
              fillColor: color,
              fillOpacity: isActive ? (isSelected ? 0.8 : 0.6) : 0.1,
              color: color,
              weight: isActive ? 2 : 1,
              opacity: isActive ? 1 : 0.2,
            }}
            eventHandlers={{
              click: () => onZoneClick(zone),
            }}
          />
        );
      })}
    </>
  );
}
