import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verify() {
  console.log('Verifying Supabase Data Migration...')

  // Check locations
  const { data: locations, count: locCount, error: locError } = await supabase
    .from('locations')
    .select('*', { count: 'exact' })

  if (locError) {
    console.error('Error fetching locations:', locError.message)
    return
  }

  console.log(`\n- Locations in DB: ${locCount}`)

  // Check photos
  const { data: photos, count: photoCount, error: photoError } = await supabase
    .from('photos')
    .select('*', { count: 'exact' })

  if (photoError) {
    console.error('Error fetching photos:', photoError.message)
    return
  }

  console.log(`- Photo records in DB: ${photoCount}`)

  // Check for orphan records
  const orphanPhotos = photos.filter(p => !locations.find(l => l.id === p.location_id))
  if (orphanPhotos.length > 0) {
    console.warn(`- ! WARNING: Found ${orphanPhotos.length} orphaned photo records.`)
  } else {
    console.log('- SUCCESS: All photos are correctly linked to locations.')
  }

  // Sample check
  if (locations.length > 0) {
    console.log(`\nSample Record (${locations[0].name}):`)
    const samplePhotos = photos.filter(p => p.location_id === locations[0].id)
    console.log(`- Coordinates: [${locations[0].longitude}, ${locations[0].latitude}]`)
    console.log(`- Categories: ${locations[0].categories.join(', ')}`)
    console.log(`- Photos: ${samplePhotos.length > 0 ? samplePhotos.map(p => p.url).join(', ') : 'None'}`)
  }

  console.log('\nVerification complete.')
}

verify().catch(console.error)
