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

  // Strict Campus Boundaries
  const maxBounds: [number, number, number, number] = [
    125.61188108286865, 7.070791075762912, // South West [lng, lat]
    125.61437821894305, 7.073515053389983  // North East [lng, lat]
  ];

  const handlePinClick = useCallback((pin: Pin) => {
    onPinClick(pin);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [pin.coordinates[1], pin.coordinates[0]],
        zoom: 20,
        pitch: 45,
        duration: 2000
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
          zoom: 18.5,
          bearing: -50,
          pitch: 40
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
