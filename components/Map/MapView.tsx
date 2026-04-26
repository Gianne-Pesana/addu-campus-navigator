'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import { CampusData, Category, Zone } from '@/types/campus';
import CampusBoundsController from './CampusBoundsController';
import ZoneLayer from './ZoneLayer';

interface MapViewProps {
  data: CampusData;
  activeCategory: Category;
  selectedZoneId?: string;
  onZoneClick: (zone: Zone) => void;
}

export default function MapView({ 
  data, 
  activeCategory, 
  selectedZoneId,
  onZoneClick 
}: MapViewProps) {
  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[7.072, 125.613]}
        zoom={18}
        zoomControl={false}
        className="w-full h-full"
        attributionControl={false}
      >
        {/* Minimalist Map Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        
        <CampusBoundsController boundary={data.boundary} />
        
        <ZoneLayer 
          zones={data.zones} 
          activeCategory={activeCategory} 
          onZoneClick={onZoneClick}
          selectedZoneId={selectedZoneId}
        />
      </MapContainer>
    </div>
  );
}
