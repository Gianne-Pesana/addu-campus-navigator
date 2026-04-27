import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { readGeoJSON, writeGeoJSON, standardizeFeature } from '@/lib/geojson';

export async function GET(request: NextRequest) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const data = await readGeoJSON();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rawFeature = await request.json();
    const newFeature = standardizeFeature(rawFeature);
    
    const data = await readGeoJSON();
    
    // Check if updating existing or adding new
    const existingIndex = data.features.findIndex(f => f.id === newFeature.id);
    
    if (existingIndex !== -1) {
      // Trust the properties sent from the client, including the photos array.
      // This ensures that if a photo was removed in the UI, it's removed in the data.
      data.features[existingIndex] = newFeature;
    } else {
      data.features.push(newFeature);
    }

    await writeGeoJSON(data);
    return NextResponse.json({ success: true, feature: newFeature });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save location' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const data = await readGeoJSON();
    const initialLength = data.features.length;
    data.features = data.features.filter(f => f.id !== id);

    if (data.features.length === initialLength) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    await writeGeoJSON(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}
