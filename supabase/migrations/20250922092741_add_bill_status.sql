-- Add publish_status column to bills table for managing draft/published state
-- Create ENUM type for bill publish status
CREATE TYPE bill_publish_status AS ENUM ('draft', 'published');

-- Add publish_status column with default value 'draft'
ALTER TABLE bills
ADD COLUMN publish_status bill_publish_status NOT NULL DEFAULT 'draft';

-- Create index for efficient filtering
CREATE INDEX idx_bills_publish_status ON bills(publish_status);

-- Update all existing bills to 'published' status
-- Since they were already public before this migration
UPDATE bills SET publish_status = 'published';

-- Add comment for documentation
COMMENT ON COLUMN bills.publish_status IS 'Publication status: draft (private) or published (public)';
COMMENT ON TYPE bill_publish_status IS 'ENUM type for bill publication status';