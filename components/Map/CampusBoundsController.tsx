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
      
      // Initial fit
      map.fitBounds(bounds, { padding: [20, 20], animate: false });
      
      // Stable zoom limits
      map.setMinZoom(17);
      map.setMaxZoom(20);
      
      // Boundary locking
      map.setMaxBounds(bounds);
      
      // Ensure the map respects the bounds firmly
      map.options.maxBoundsViscosity = 1.0;
    }
  }, [map, boundary]);

  return null;
}
