import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { readGeoJSON } from '@/lib/geojson';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import convert from 'heic-convert';

export async function POST(request: NextRequest) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const locationId = formData.get('locationId') as string;

    if (!image || !locationId) {
      return NextResponse.json({ error: 'Image and locationId are required' }, { status: 400 });
    }

    const data = await readGeoJSON();
    const feature = data.features.find(f => f.id === locationId);

    if (!feature) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    
    // Format names for storage
    const buildingRaw = feature.properties.building || 'unknown';
    const buildingSlug = buildingRaw.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    const nameRaw = feature.properties.name || 'location';
    const nameSlug = nameRaw.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

    const imagesDir = path.join(process.cwd(), 'public', 'images', buildingSlug);
    await fs.mkdir(imagesDir, { recursive: true });

    // Determine naming index
    const existingFiles = await fs.readdir(imagesDir);
    let nextIndex = 1;
    for (const file of existingFiles) {
      if (file.startsWith(`${nameSlug}-`) && file.endsWith('.jpg')) {
        const match = file.match(/-(\d+)\.jpg$/);
        if (match?.[1]) {
          const idx = parseInt(match[1], 10);
          if (idx >= nextIndex) nextIndex = idx + 1;
        }
      }
    }

    const fileName = `${nameSlug}-${nextIndex}.jpg`;
    const filePath = path.join(imagesDir, fileName);

    // Get buffer
    const arrayBuffer = await image.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    // Convert HEIC if needed
    const isHeic = image.name.toLowerCase().endsWith('.heic') || image.name.toLowerCase().endsWith('.heif');
    if (isHeic) {
      try {
        const outputBuffer = await convert({
          buffer: buffer,
          format: 'JPEG',
          quality: 1
        });
        buffer = Buffer.from(outputBuffer);
      } catch (err) {
        console.error('HEIC Conversion failed:', err);
        return NextResponse.json({ error: 'Failed to convert HEIC image' }, { status: 500 });
      }
    }

    // Standardize and compress with sharp
    await sharp(buffer)
      .rotate() 
      .resize({ 
        width: 1600, 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ 
        quality: 80, 
        progressive: true,
        mozjpeg: true 
      })
      .toFile(filePath);

    // Return the URL ONLY - Don't update GeoJSON here yet
    // This allows the user to 'Cancel' the modal without orphaning data
    const publicPath = `/images/${buildingSlug}/${fileName}`;
    return NextResponse.json({ success: true, photoUrl: publicPath });

  } catch (error) {
    console.error('Upload image error:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
