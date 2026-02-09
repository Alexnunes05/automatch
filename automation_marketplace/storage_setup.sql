-- storage_setup.sql
-- Create a new private bucket for images if it doesn't exist
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Set up security policies for the 'images' bucket

-- 1. Allow public read access to all images
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'images' );

-- 2. Allow authenticated users to upload images
drop policy if exists "Authenticated users can upload" on storage.objects;
create policy "Authenticated users can upload"
on storage.objects for insert
with check ( bucket_id = 'images' and auth.role() = 'authenticated' );

-- 3. Allow users to update/delete their own images (optional, but good for cleanup)
drop policy if exists "Users can update own images" on storage.objects;
create policy "Users can update own images"
on storage.objects for update
using ( bucket_id = 'images' and auth.uid() = owner )
with check ( bucket_id = 'images' and auth.uid() = owner );

drop policy if exists "Users can delete own images" on storage.objects;
create policy "Users can delete own images"
on storage.objects for delete
using ( bucket_id = 'images' and auth.uid() = owner );
