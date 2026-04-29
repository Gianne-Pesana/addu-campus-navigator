import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { standardizeFeature } from '@/lib/geojson';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  const features = data.map((loc: any) => ({
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

  return NextResponse.json({ type: 'FeatureCollection', features });
}

import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(request: NextRequest) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    const rawFeature = await request.json();
    const feature = standardizeFeature(rawFeature);
    const { properties, geometry } = feature;

    const locationData: any = {
      name: properties.name,
      description: properties.description,
      building: properties.building,
      how_to_get_there: properties.howToGetThere,
      longitude: geometry.coordinates[0],
      latitude: geometry.coordinates[1],
      categories: properties.category,
      floors: properties.floors,
      tags: properties.tags,
    };

    // If it's a UUID, use it as ID. If it's a legacy pin-ID, use legacy_id
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(feature.id);
    
    let result;
    if (isUUID) {
      locationData.id = feature.id;
      result = await supabase
        .from('locations')
        .upsert(locationData)
        .select()
        .single();
    } else {
      locationData.legacy_id = feature.id;
      result = await supabase
        .from('locations')
        .upsert(locationData, { onConflict: 'legacy_id' })
        .select()
        .single();
    }

    if (result.error) throw result.error;

    // Sync photos if they were removed in the UI
    const incomingPhotos = properties.photos.filter(p => p !== 'n/a');
    
    if (incomingPhotos.length > 0) {
        const currentUrls = incomingPhotos.map((p: any) => typeof p === 'string' ? p : p.url);
        
        await supabase
            .from('photos')
            .delete()
            .eq('location_id', result.data.id)
            .not('url', 'in', `(${currentUrls.map(u => `"${u}"`).join(',')})`);
    }

    return NextResponse.json({ success: true, location: result.data });
  } catch (error: any) {
    console.error('Save location error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const query = supabase.from('locations').delete();
    if (isUUID) {
      query.eq('id', id);
    } else {
      query.eq('legacy_id', id);
    }

    const { error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
