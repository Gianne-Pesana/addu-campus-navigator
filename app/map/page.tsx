'use client';

import { useState, useEffect } from 'react';
import { CampusData, Category, Zone } from '@/types/campus';
import { MapView } from '@/components/Map';
import FilterBar from '@/components/UI/FilterBar';
import BottomSheet from '@/components/UI/BottomSheet';

const CATEGORIES: Category[] = [
  'Study Spots',
  'Restrooms (CR)',
  'Hangout Areas',
  'Food Areas',
  'Offices / Services'
];

export default function MapPage() {
  const [data, setData] = useState<CampusData | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('Study Spots');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  useEffect(() => {
    fetch('/data/campus-zones.json')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Failed to load campus data:', err));
  }, []);

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone);
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
          setSelectedZone(null); // Clear selection when category changes
        }} 
      />
      
      <MapView 
        data={data} 
        activeCategory={activeCategory} 
        selectedZoneId={selectedZone?.id}
        onZoneClick={handleZoneClick}
      />
      
      <BottomSheet 
        zone={selectedZone} 
        onClose={() => setSelectedZone(null)} 
      />
    </div>
  );
}
