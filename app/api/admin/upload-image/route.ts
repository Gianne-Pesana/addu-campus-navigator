import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { readGeoJSON, writeGeoJSON } from '@/lib/geojson';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

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
    const featureIndex = data.features.findIndex(f => f.id === locationId);

    if (featureIndex === -1) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const feature = data.features[featureIndex];
    
    // Format building name for folder
    const buildingRaw = feature.properties.building || 'unknown';
    const buildingSlug = buildingRaw.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    
    // Format location name for file
    const nameRaw = feature.properties.name || 'location';
    const nameSlug = nameRaw.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

    const imagesDir = path.join(process.cwd(), 'public', 'images', buildingSlug);
    
    // Ensure directory exists
    await fs.mkdir(imagesDir, { recursive: true });

    // Determine next index
    const existingFiles = await fs.readdir(imagesDir);
    let nextIndex = 1;
    
    for (const file of existingFiles) {
      if (file.startsWith(`${nameSlug}-`) && file.endsWith('.jpg')) {
        const match = file.match(/-(\d+)\.jpg$/);
        if (match && match[1]) {
          const idx = parseInt(match[1], 10);
          if (idx >= nextIndex) {
            nextIndex = idx + 1;
          }
        }
      }
    }

    const fileName = `${nameSlug}-${nextIndex}.jpg`;
    const filePath = path.join(imagesDir, fileName);

    // Process and compress image with sharp
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await sharp(buffer)
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toFile(filePath);

    // Update geojson
    const publicPath = `/images/${buildingSlug}/${fileName}`;
    
    let currentPhotos = feature.properties.photos || [];
    if (currentPhotos.length === 1 && currentPhotos[0] === 'n/a') {
      currentPhotos = [];
    }
    
    feature.properties.photos = [...currentPhotos, publicPath];
    data.features[featureIndex] = feature;

    await writeGeoJSON(data);

    return NextResponse.json({ success: true, photoUrl: publicPath });

  } catch (error) {
    console.error('Upload image error:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
