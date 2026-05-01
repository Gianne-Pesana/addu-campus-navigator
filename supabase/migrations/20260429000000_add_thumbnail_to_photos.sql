-- Add thumbnail_url to photos table
alter table public.photos add column thumbnail_url text;

-- Optional: Update existing records to use the main url as thumbnail for now
update public.photos set thumbnail_url = url where thumbnail_url is null;
