# Supabase Migration Guide

This project has been migrated from a local file-based data system (GeoJSON + local images) to a cloud-based solution using **Supabase (Postgres + Storage)**. This resolves the `EROFS: read-only file system` errors encountered on Vercel.

## 1. Supabase Setup

### Database Schema
Go to the **SQL Editor** in your Supabase dashboard and run the contents of `supabase/migrations/20260428000000_initial_schema.sql`. This will create:
- `locations` table: Stores map pins and metadata.
- `photos` table: Stores relational links to image URLs.
- Row Level Security (RLS) policies for public read access.
- Indexes for performance and full-text search.

### Storage Bucket
1. Go to **Storage** in Supabase.
2. Create a new bucket named `locations`.
3. Set the bucket to **Public** (so images can be viewed without signed URLs).

## 2. Environment Variables

Update your `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_public_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (Required for migration script)
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=your_secret
```

## 3. Run Migration

To migrate your existing `pinData.geojson` and local images to Supabase, run the migration script:

```bash
# Make sure you have the SUPABASE_SERVICE_ROLE_KEY in .env.local
node scripts/migrate.mjs
```

This script will:
- Read `public/data/pinData.geojson`.
- Upload all local images from `public/images` to the `locations` bucket.
- Insert all records into the Postgres database.
- Map legacy IDs (e.g., `pin-0`) to new UUIDs.

## 4. Verify Migration

Run the verification script to ensure everything is correct:

```bash
node scripts/verify.mjs
```

## 5. Architectural Changes

### Data Fetching
- **Client-side:** The map now fetches data from `/api/locations` instead of the static `.geojson` file.
- **Server-side:** `lib/geojson.ts` now uses the Supabase server client to perform joins between locations and photos.

### Admin Dashboard
- **Create/Edit:** Updates are sent to Supabase Postgres.
- **Image Upload:** Images are processed with `sharp` (resized/compressed) and uploaded directly to Supabase Storage.
- **Delete:** Deleting a location automatically deletes its associated photo records (via cascading foreign keys).

### Authentication
- Uses the existing simple password/JWT approach but is now compatible with Supabase's SSR helpers via `middleware.ts` for session persistence.

## 6. Best Practices Implemented
- **Relational Integrity:** Photos are linked to locations via foreign keys.
- **Performance:** GIN indexes for search and composite indexes for coordinates.
- **Storage:** Folder-based structure in buckets (`/locations/{location_id}/{filename}`).
- **Security:** RLS policies allow anyone to view map data but restrict writes to your API (protected by your admin password).
