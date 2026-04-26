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
    <div className="w-full h-full relative overflow-hidden bg-[#f0f2f5]">
      <MapContainer
        center={[7.07215, 125.61312]}
        zoom={19}
        zoomControl={false}
        className="w-full h-full"
        attributionControl={false}
      >
        {/* OpenStreetMap Standard Tiles - High reliability, no rotation bugs */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
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
