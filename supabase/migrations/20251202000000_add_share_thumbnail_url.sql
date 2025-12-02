-- Add share_thumbnail_url column to bills table for Twitter/share OGP
ALTER TABLE bills ADD COLUMN share_thumbnail_url TEXT;

-- Add comment for the new column
COMMENT ON COLUMN bills.share_thumbnail_url IS 'URL to the share/Twitter OGP image stored in Supabase Storage';

