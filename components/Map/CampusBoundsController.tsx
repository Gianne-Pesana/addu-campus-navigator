'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface CampusBoundsControllerProps {
  boundary: [number, number][];
}

export default function CampusBoundsController({ boundary }: CampusBoundsControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (boundary && boundary.length > 0) {
      const bounds = L.latLngBounds(boundary);
      
      // Set initial view
      map.fitBounds(bounds, { padding: [20, 20] });
      
      // Restrict map panning
      map.setMaxBounds(bounds.pad(0.1)); // Slight padding to allow some breathing room but keep it locked
      
      // Set zoom limits
      map.setMinZoom(17);
      map.setMaxZoom(20);
    }
  }, [map, boundary]);

  return null;
}
