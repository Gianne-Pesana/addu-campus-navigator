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
      
      // Initial fit - tight view on campus
      map.fitBounds(bounds, { padding: [10, 10], animate: false });
      
      // Strict zoom limits
      map.setMinZoom(18);
      map.setMaxZoom(22);
      
      // Boundary locking
      map.setMaxBounds(bounds);
      
      // Ensure the map respects the bounds firmly
      map.options.maxBoundsViscosity = 1.0;
    }
  }, [map, boundary]);

  return null;
}
