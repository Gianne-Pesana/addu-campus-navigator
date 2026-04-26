'use client';

import { useState, useEffect } from 'react';
import { CampusData, Category, Pin } from '@/types/campus';
import { MapView } from '@/components/Map';
import FilterBar from '@/components/UI/FilterBar';
import BottomSheet from '@/components/UI/BottomSheet';

const CATEGORIES: Category[] = [
  'all',
  'study',
  'hangout',
  'food',
  'library',
  'restroom',
  'office'
];

export default function MapPage() {
  const [data, setData] = useState<CampusData | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);

  useEffect(() => {
    // Fetch the standardized GeoJSON data
    fetch('/data/pinData.geojson')
      .then(res => res.json())
      .then((geoJson) => {
        // Transform GeoJSON to internal CampusData format
        const pins: Pin[] = geoJson.features.map((feature: any) => ({
          id: feature.properties.id,
          name: feature.properties.name,
          category: feature.properties.category,
          description: feature.properties.description,
          building: feature.properties.building,
          floors: feature.properties.floors,
          tags: feature.properties.tags,
          howToGetThere: feature.properties.howToGetThere,
          coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]] // [lat, lng]
        }));

        const boundary: [number, number][] = [
          [7.0715528428473675, 125.61437821894305],
          [7.073515053389983, 125.61292674674525],
          [7.0727532895433995, 125.61188108286865],
          [7.070791075762912, 125.61333255506639],
          [7.0715528428473675, 125.61437821894305]
        ];

        setData({ pins, boundary });
      })
      .catch(err => console.error('Failed to load pin data:', err));
  }, []);

  const handlePinClick = (pin: Pin) => {
    setSelectedPin(pin);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 font-medium">Initializing Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Brand Overlay */}
      <div className="fixed bottom-6 left-6 z-[1000] pointer-events-none hidden md:block">
        <h1 className="text-xl font-bold text-zinc-900/40 tracking-tight">
          Campus Navigator
        </h1>
      </div>

      <FilterBar 
        categories={CATEGORIES} 
        activeCategory={activeCategory} 
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          setSelectedPin(null); // Clear selection when category changes
        }} 
      />
      
      <MapView 
        data={data} 
        activeCategory={activeCategory} 
        selectedPinId={selectedPin?.id}
        onPinClick={handlePinClick}
      />
      
      {/* Map Pin Detail View */}
      <BottomSheet 
        pin={selectedPin} 
        onClose={() => setSelectedPin(null)} 
      />
    </div>
  );
}
