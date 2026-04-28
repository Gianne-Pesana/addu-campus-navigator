import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { GeoJSONData, GeoJSONFeature, Pin } from '@/types/campus';

export async function readGeoJSON(): Promise<GeoJSONData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('locations')
    .select(`
      *,
      photos (
        url,
        alt_text
      )
    `)
    .order('name');

  if (error) {
    console.error('Failed to read locations from Supabase:', error);
    return { type: 'FeatureCollection', features: [] };
  }

  const features: GeoJSONFeature[] = data.map((loc: any) => ({
    type: 'Feature',
    id: loc.legacy_id || loc.id,
    geometry: {
      type: 'Point',
      coordinates: [loc.longitude, loc.latitude]
    },
    properties: {
      id: loc.legacy_id || loc.id,
      name: loc.name,
      category: loc.categories || [],
      description: loc.description || '',
      building: loc.building || '',
      floors: loc.floors || [],
      tags: loc.tags || [],
      photos: loc.photos && loc.photos.length > 0 
        ? loc.photos.map((p: any) => ({ url: p.url, alt: p.alt_text })) 
        : ['n/a'],
      howToGetThere: loc.how_to_get_there || ''
    }
  }));

  return { type: 'FeatureCollection', features };
}

export async function writeGeoJSON(data: GeoJSONData): Promise<void> {
  // This is a legacy function for the file-based system.
  // In Supabase, we should use direct table updates.
  // I'll keep it as a placeholder or implement it via batch upsert if needed.
  console.warn('writeGeoJSON is deprecated. Use direct Supabase table operations.');
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
    
    const existingIndex = merged.findIndex(f => 
      f.id === stdFeature.id || 
      f.properties.name.toLowerCase() === stdFeature.properties.name.toLowerCase()
    );

    if (existingIndex !== -1) {
      const existing = merged[existingIndex];
      stdFeature.id = existing.id;
      stdFeature.properties.id = existing.properties.id;
      stdFeature.properties.photos = existing.properties.photos;
      merged[existingIndex] = stdFeature;
    } else {
      merged.push(stdFeature);
    }
  }

  return merged;
}
