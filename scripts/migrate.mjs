import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrate() {
  console.log('Starting migration to Supabase...')

  // 1. Create bucket if it doesn't exist
  console.log('Checking storage bucket...')
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket('locations', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
  })
  
  if (bucketError && bucketError.message !== 'Bucket already exists') {
    console.warn('Bucket creation note:', bucketError.message)
  }

  // 2. Read GeoJSON
  const dataPath = path.join(process.cwd(), 'public', 'data', 'pinData.geojson')
  console.log(`Reading data from ${dataPath}...`)
  const fileContent = await fs.readFile(dataPath, 'utf8')
  const geojson = JSON.parse(fileContent)

  let successCount = 0
  let photoCount = 0

  for (const feature of geojson.features) {
    const { properties, geometry } = feature
    const { id: legacy_id, name, description, building, floors, tags, photos, howToGetThere, category } = properties
    const [lng, lat] = geometry.coordinates

    console.log(`\nMigrating: ${name} (${legacy_id})`)

    // Insert/Upsert location
    const { data: location, error: locError } = await supabase
      .from('locations')
      .upsert({
        legacy_id,
        name,
        description,
        building,
        how_to_get_there: howToGetThere,
        longitude: lng,
        latitude: lat,
        categories: category,
        floors,
        tags
      }, { onConflict: 'legacy_id' })
      .select()
      .single()

    if (locError) {
      console.error(`Error inserting location ${name}:`, locError.message)
      continue
    }

    const locationId = location.id
    successCount++

    // Handle photos
    if (Array.isArray(photos)) {
      for (const photo of photos) {
        if (photo === 'n/a') continue

        let photoUrlPath = ''
        let altText = ''

        if (typeof photo === 'string') {
          photoUrlPath = photo
        } else {
          photoUrlPath = photo.url
          altText = photo.alt
        }

        // photoUrlPath is like /images/finster_hall/finster_lounge_1-2.jpg
        // Local path: public/images/...
        const localPath = path.join(process.cwd(), 'public', photoUrlPath)
        
        try {
          const fileBuffer = await fs.readFile(localPath)
          const fileName = path.basename(photoUrlPath)
          const storagePath = `${locationId}/${fileName}`

          console.log(`  Uploading photo: ${fileName}...`)

          // Upload to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('locations')
            .upload(storagePath, fileBuffer, {
              contentType: 'image/jpeg',
              upsert: true
            })

          if (uploadError) {
            console.error(`  Error uploading photo ${fileName}:`, uploadError.message)
            continue
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('locations')
            .getPublicUrl(storagePath)

          // Insert photo record
          const { error: photoDbError } = await supabase.from('photos').upsert({
            location_id: locationId,
            url: publicUrl,
            alt_text: altText || name
          }, { onConflict: 'location_id, url' }) // Requires unique constraint if we want to avoid duplicates

          if (photoDbError) {
             // If we don't have a unique constraint yet, just insert
             await supabase.from('photos').insert({
              location_id: locationId,
              url: publicUrl,
              alt_text: altText || name
            })
          }

          photoCount++
        } catch (err) {
          console.error(`  Photo file not found: ${localPath}`)
        }
      }
    }
  }

  console.log(`\nMigration Summary:`)
  console.log(`- Locations migrated: ${successCount}`)
  console.log(`- Photos uploaded: ${photoCount}`)
  console.log('Migration completed successfully!')
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
