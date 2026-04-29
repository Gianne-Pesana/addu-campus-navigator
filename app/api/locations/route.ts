import { NextResponse } from 'next/server';
import { readGeoJSON } from '@/lib/geojson';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await readGeoJSON();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}
