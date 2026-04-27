import fs from 'fs/promises';
import path from 'path';
import { GeoJSONData, GeoJSONFeature } from '@/types/campus';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'pinData.geojson');

export async function readGeoJSON(): Promise<GeoJSONData> {
  try {
    const fileContents = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(fileContents) as GeoJSONData;
  } catch (error) {
    console.error('Failed to read GeoJSON:', error);
    // Return empty skeleton if file doesn't exist
    return { type: 'FeatureCollection', features: [] };
  }
}

export async function writeGeoJSON(data: GeoJSONData): Promise<void> {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to write GeoJSON:', error);
    throw new Error('Failed to write data');
  }
}

export function standardizeFeature(feature: any): GeoJSONFeature {
  const props = feature.properties || {};
  const geom = feature.geometry || { type: 'Point', coordinates: [0, 0] };
  const id = feature.id || props.id || `pin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  return {
    type: 'Feature',
    id: id,
    geometry: {
      type: 'Point',
      coordinates: Array.isArray(geom.coordinates) && geom.coordinates.length === 2 
        ? [Number(geom.coordinates[0]), Number(geom.coordinates[1])] 
        : [0, 0]
    },
    properties: {
      id: id,
      name: props.name || 'Unnamed Location',
      category: Array.isArray(props.category) ? props.category : (typeof props.category === 'string' ? [props.category] : ['office']),
      description: props.description || 'No description provided.',
      building: props.building || 'Unknown Building',
      floors: Array.isArray(props.floors) ? props.floors : (typeof props.floors === 'string' ? [props.floors] : ['1st']),
      tags: Array.isArray(props.tags) ? props.tags : (typeof props.tags === 'string' ? props.tags.split(',').map((t: string) => t.trim()) : []),
      photos: Array.isArray(props.photos) && props.photos.length > 0 ? props.photos : ['n/a'],
      howToGetThere: props.howToGetThere || ''
    }
  };
}

export function mergeFeatures(existingFeatures: GeoJSONFeature[], newFeatures: any[]): GeoJSONFeature[] {
  const merged = [...existingFeatures];

  for (const rawFeature of newFeatures) {
    const stdFeature = standardizeFeature(rawFeature);
    
    // Check for duplicate by ID or exact Name (case-insensitive)
    const existingIndex = merged.findIndex(f => 
      f.id === stdFeature.id || 
      f.properties.name.toLowerCase() === stdFeature.properties.name.toLowerCase()
    );

    if (existingIndex !== -1) {
      // Preserve ID and photos from existing feature, but overwrite other properties and geometry
      const existing = merged[existingIndex];
      stdFeature.id = existing.id;
      stdFeature.properties.id = existing.properties.id;
      
      // Merge photos (keep existing if new is "n/a", or combine if both have photos)
      // For simplicity and safety, keep existing photos during a batch import unless explicitly overwriting via editor
      stdFeature.properties.photos = existing.properties.photos;

      merged[existingIndex] = stdFeature;
    } else {
      merged.push(stdFeature);
    }
  }

  return merged;
}
