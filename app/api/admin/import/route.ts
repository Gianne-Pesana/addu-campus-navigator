import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { standardizeFeature } from '@/lib/geojson';

export async function POST(request: NextRequest) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileContent = await file.text();
    const parsedData = JSON.parse(fileContent);

    if (parsedData.type !== 'FeatureCollection' || !Array.isArray(parsedData.features)) {
      return NextResponse.json({ error: 'Invalid GeoJSON format' }, { status: 400 });
    }

    const newFeatures = parsedData.features;
    let successCount = 0;

    for (const rawFeature of newFeatures) {
        const feature = standardizeFeature(rawFeature);
        const { properties, geometry } = feature;

        const locationData = {
          legacy_id: feature.id,
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

        const { error } = await supabase
          .from('locations')
          .upsert(locationData, { onConflict: 'legacy_id' });

        if (!error) successCount++;
    }

    return NextResponse.json({ success: true, count: successCount });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
