-- Create locations table
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique, -- stores current IDs like 'pin-123'
  name text not null,
  description text,
  building text,
  how_to_get_there text,
  longitude float8 not null,
  latitude float8 not null,
  categories text[] default '{}',
  floors text[] default '{}',
  tags text[] default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create photos table
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references public.locations(id) on delete cascade not null,
  url text not null,
  alt_text text,
  created_at timestamptz default now() not null,
  unique(location_id, url)
);

-- Enable RLS
alter table public.locations enable row level security;
alter table public.photos enable row level security;

-- Public read access
create policy "Allow public read access on locations" on public.locations for select using (true);
create policy "Allow public read access on photos" on public.photos for select using (true);

-- Function for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on public.locations
for each row execute function public.handle_updated_at();

-- Indexes
create index idx_locations_name on public.locations using gin (to_tsvector('english', name));
create index idx_locations_building on public.locations(building);
create index idx_photos_location_id on public.photos(location_id);
create index idx_locations_coords on public.locations(latitude, longitude);
