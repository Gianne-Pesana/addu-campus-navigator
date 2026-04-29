'use client';

import { Map, MapRef, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CampusData, Category, Pin } from '@/types/campus';
import PinLayer from './PinLayer';
import { useCallback, useRef, useMemo } from 'react';

interface MapViewProps {
  data: CampusData;
  activeCategory: Category;
  selectedPinId?: string;
  onPinClick: (pin: Pin) => void;
  mapStyle: string; // Passed from parent
}

export default function MapView({ 
  data, 
  activeCategory, 
  selectedPinId,
  onPinClick,
  mapStyle
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);

  // Hardcoded Gate Polygons
  const gatesGeoJSON = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: { name: 'Jacinto Gate (Gate 1)' },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [125.6137146, 7.0724154],
            [125.6137285, 7.0723992],
            [125.6137168, 7.0723908],
            [125.6137041, 7.0724059],
            [125.6137146, 7.0724154]
          ]]
        }
      },
      {
        type: 'Feature' as const,
        properties: { name: 'Roxas Gate (Gate 2)' },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [125.61283, 7.0717517],
            [125.6128728, 7.0717018],
            [125.6128593, 7.0716905],
            [125.6128166, 7.0717404],
            [125.61283, 7.0717517]
          ]]
        }
      },
      {
        type: 'Feature' as const,
        properties: { name: 'Claveria Gate (Gate 3)' },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [125.6123236, 7.0726244],
            [125.6123283, 7.0726433],
            [125.6123449, 7.0726372],
            [125.6123405, 7.0726181],
            [125.6123236, 7.0726244]
          ]]
        }
      },
      {
        type: 'Feature' as const,
        properties: { name: 'Dotterweich Gate (Gate 4)' },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [125.613238, 7.0729153],
            [125.6132564, 7.0728959],
            [125.613238, 7.0728855],
            [125.6132227, 7.0729036],
            [125.613238, 7.0729153]
          ]]
        }
      },
      {
        type: 'Feature' as const,
        properties: { name: 'CCFC Gate' },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [125.6131796, 7.0712868],
            [125.6132084, 7.0712521],
            [125.6132267, 7.0712671],
            [125.6131958, 7.0713011],
            [125.6131796, 7.0712868]
          ]]
        }
      }
    ]
  }), []);

  // Strict Campus Boundaries - Slightly shrunk for better focus
  const maxBounds: [number, number, number, number] = [
    125.61208108286865, 7.070991075762912, // South West [lng, lat]
    125.61417821894305, 7.073315053389983  // North East [lng, lat]
  ];

  const handlePinClick = useCallback((pin: Pin) => {
    onPinClick(pin);
    if (mapRef.current) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      
      mapRef.current.easeTo({
        center: [pin.coordinates[1], pin.coordinates[0]],
        zoom: 19.5, 
        offset: isMobile ? [0, -150] : [0, 0],
        duration: 800
      });
    }
  }, [onPinClick]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-background">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 125.61312,
          latitude: 7.07215,
          zoom: 17.8,
          bearing: 50,
          pitch: 0 
        }}
        mapStyle={mapStyle}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        maxBounds={maxBounds}
        minZoom={17.5}
        maxZoom={22}
        reuseMaps
        style={{ width: '100%', height: '100%' }}
      >
        {/* Gates Layer */}
        <Source id="gates-source" type="geojson" data={gatesGeoJSON}>
          <Layer
            id="gates-fill"
            type="fill"
            paint={{
              'fill-color': '#4f46e5', // Indigo-600
              'fill-opacity': 0.7,
              'fill-outline-color': '#ffffff'
            }}
          />
          <Layer
            id="gates-labels"
            type="symbol"
            layout={{
              'text-field': ['get', 'name'],
              'text-size': 11,
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-offset': [0, 1.2],
              'text-anchor': 'top',
              'text-allow-overlap': false
            }}
            paint={{
              'text-color': '#4f46e5',
              'text-halo-color': '#ffffff',
              'text-halo-width': 2
            }}
          />
        </Source>

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
