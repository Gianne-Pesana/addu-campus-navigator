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

    const { data: existingLocations, error: fetchError } = await supabase
      .from('locations')
      .select('legacy_id, name, longitude, latitude');

    if (fetchError) {
      throw fetchError;
    }

    const newFeatures = parsedData.features;
    let successCount = 0;
    let skipCount = 0;

    for (const rawFeature of newFeatures) {
        const feature = standardizeFeature(rawFeature);
        const { properties, geometry } = feature;

        const isDuplicate = existingLocations.some(loc => 
          (feature.id && loc.legacy_id === feature.id) || 
          (loc.name.toLowerCase() === properties.name.toLowerCase()) ||
          (loc.longitude === geometry.coordinates[0] && loc.latitude === geometry.coordinates[1])
        );

        if (isDuplicate) {
          skipCount++;
          continue;
        }

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

        const { error: insertError } = await supabase
          .from('locations')
          .insert(locationData);

        if (!insertError) {
          successCount++;
          // Add to existingLocations to prevent duplicates within the same import file
          existingLocations.push({
            legacy_id: feature.id,
            name: properties.name,
            longitude: geometry.coordinates[0],
            latitude: geometry.coordinates[1]
          });
        }
    }

    return NextResponse.json({ 
      success: true, 
      count: successCount, 
      skipped: skipCount 
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
