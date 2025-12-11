-- Add 'coming_soon' to bill_publish_status enum
ALTER TYPE bill_publish_status ADD VALUE 'coming_soon';

-- Add shugiin_url column to bills table for linking to House of Representatives page
ALTER TABLE bills
ADD COLUMN shugiin_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN bills.shugiin_url IS 'URL to the House of Representatives (衆議院) page for this bill';

