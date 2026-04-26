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
        minZoom={18}
        maxZoom={24}
        zoomSnap={0.1}
        zoomDelta={0.5}
        zoomControl={false}
        className="w-full h-full"
        attributionControl={false}
      >
        {/* Mapbox Streets v12 - With extreme zoom scaling enabled */}
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
          tileSize={512}
          zoomOffset={-1}
          maxZoom={24}
          maxNativeZoom={22}
          opacity={0.8}
          attribution='© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
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
