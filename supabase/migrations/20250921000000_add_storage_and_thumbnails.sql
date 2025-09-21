-- Create storage bucket for bill thumbnails
INSERT INTO storage.buckets (id, name, public) VALUES ('bill-thumbnails', 'bill-thumbnails', true);

-- Create policy to allow public read access to bill thumbnails
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'bill-thumbnails');

-- Create policy to allow authenticated users to upload/update bill thumbnails
CREATE POLICY "Authenticated users can upload bill thumbnails" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'bill-thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update bill thumbnails" ON storage.objects FOR UPDATE USING (bucket_id = 'bill-thumbnails' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete bill thumbnails
CREATE POLICY "Authenticated users can delete bill thumbnails" ON storage.objects FOR DELETE USING (bucket_id = 'bill-thumbnails' AND auth.role() = 'authenticated');

-- Add thumbnail_url column to bills table
ALTER TABLE bills ADD COLUMN thumbnail_url TEXT;

-- Add comment for the new column
COMMENT ON COLUMN bills.thumbnail_url IS 'URL to the bill thumbnail image stored in Supabase Storage';