import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { readGeoJSON, writeGeoJSON, mergeFeatures } from '@/lib/geojson';

export async function POST(request: NextRequest) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

    const currentData = await readGeoJSON();
    const newFeatures = parsedData.features;

    const mergedFeatures = mergeFeatures(currentData.features, newFeatures);

    await writeGeoJSON({
      type: 'FeatureCollection',
      features: mergedFeatures
    });

    return NextResponse.json({ success: true, count: mergedFeatures.length });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import data' }, { status: 500 });
  }
}
