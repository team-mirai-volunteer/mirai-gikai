-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload bill thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update bill thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete bill thumbnails" ON storage.objects;

-- Create function to check if user has admin role in public schema
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND raw_app_meta_data->>'roles' LIKE '%admin%'
    )
  );
END;
$$;

-- Create new policies with admin role requirement
CREATE POLICY "Admin users can upload bill thumbnails"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'bill-thumbnails'
  AND public.is_admin()
);

CREATE POLICY "Admin users can update bill thumbnails"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'bill-thumbnails'
  AND public.is_admin()
);

CREATE POLICY "Admin users can delete bill thumbnails"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'bill-thumbnails'
  AND public.is_admin()
);