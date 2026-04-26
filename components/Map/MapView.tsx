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
        zoom={18}
        zoomControl={false}
        className="w-full h-full"
        attributionControl={false}
      >
        {/* CARTO Voyager - Clean colored style, high reliability */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
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
