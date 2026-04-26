'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import { CampusData, Category, Pin } from '@/types/campus';
import CampusBoundsController from './CampusBoundsController';
import PinLayer from './PinLayer';

interface MapViewProps {
  data: CampusData;
  activeCategory: Category;
  selectedPinId?: string;
  onPinClick: (pin: Pin) => void;
}

export default function MapView({ 
  data, 
  activeCategory, 
  selectedPinId,
  onPinClick 
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
        {/* OpenStreetMap Standard Tiles - Dimmed for maximum visibility of pins */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          opacity={0.6}
        />
        
        <CampusBoundsController boundary={data.boundary} />
        
        <PinLayer 
          pins={data.pins} 
          activeCategory={activeCategory} 
          onPinClick={onPinClick}
          selectedPinId={selectedPinId}
        />
      </MapContainer>
    </div>
  );
}
