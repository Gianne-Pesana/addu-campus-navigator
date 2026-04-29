import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import sharp from 'sharp';

import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(request: NextRequest) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const locationId = formData.get('locationId') as string;

    if (!image || !locationId) {
      return NextResponse.json({ error: 'Image and locationId are required' }, { status: 400 });
    }

    // Check if location exists (handles legacy_id or UUID)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(locationId);
    const { data: location, error: locError } = await supabase
      .from('locations')
      .select('id, name')
      .or(isUUID ? `id.eq.${locationId}` : `legacy_id.eq.${locationId}`)
      .single();

    if (locError || !location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Process image with sharp
    const arrayBuffer = await image.arrayBuffer();
    let inputBuffer = Buffer.from(arrayBuffer);

    // Convert HEIC to JPEG if necessary
    const isHeic = image.type === 'image/heic' || 
                   image.type === 'image/heif' || 
                   image.type === 'image/heic-sequence' ||
                   image.name.toLowerCase().endsWith('.heic') || 
                   image.name.toLowerCase().endsWith('.heif');

    if (isHeic) {
      // @ts-ignore - heic-convert might not have perfect types for default import in all environments
      const heicConvert = (await import('heic-convert')).default;
      inputBuffer = Buffer.from(await heicConvert({
        buffer: inputBuffer as any,
        format: 'JPEG',
        quality: 1
      }));
    }

    const buffer = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toBuffer();

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
    const storagePath = `${location.id}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('locations')
      .upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('locations')
      .getPublicUrl(storagePath);

    // Save to photos table
    const { error: photoError } = await supabase
      .from('photos')
      .insert({
        location_id: location.id,
        url: publicUrl,
        alt_text: location.name
      });

    if (photoError) throw photoError;

    return NextResponse.json({ success: true, photoUrl: publicUrl });

  } catch (error: any) {
    console.error('Upload image error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
