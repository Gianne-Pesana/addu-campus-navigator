'use client';

import { Map, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CampusData, Category, Pin } from '@/types/campus';
import PinLayer from './PinLayer';
import { useCallback, useRef } from 'react';

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
  const mapRef = useRef<MapRef>(null);

  // Strict Campus Boundaries - Slightly shrunk for better focus
  const maxBounds: [number, number, number, number] = [
    125.61208108286865, 7.070991075762912, // South West [lng, lat]
    125.61417821894305, 7.073315053389983  // North East [lng, lat]
  ];

  const handlePinClick = useCallback((pin: Pin) => {
    onPinClick(pin);
    if (mapRef.current) {
      // Smart Centering: On mobile, we offset the center vertically to ensure
      // the pin isn't covered by the bottom sheet.
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      
      mapRef.current.easeTo({
        center: [pin.coordinates[1], pin.coordinates[0]],
        zoom: 19.5, 
        offset: isMobile ? [0, -150] : [0, 0], // Pushes the pin into the upper viewport
        duration: 800
      });
    }
  }, [onPinClick]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#f0f2f5]">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 125.61312,
          latitude: 7.07215,
          zoom: 17.8,
          bearing: -50,
          pitch: 0 
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        maxBounds={maxBounds}
        minZoom={17.5}
        maxZoom={22}
        reuseMaps
        style={{ width: '100%', height: '100%' }}
      >
        <PinLayer 
          pins={data.pins} 
          activeCategory={activeCategory} 
          onPinClick={handlePinClick}
          selectedPinId={selectedPinId}
        />
      </Map>
    </div>
  );
}
