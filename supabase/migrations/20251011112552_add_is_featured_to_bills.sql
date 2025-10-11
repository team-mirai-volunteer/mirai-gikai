-- Add is_featured column to bills table
ALTER TABLE bills
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for efficient querying of featured bills
CREATE INDEX idx_bills_is_featured ON bills(is_featured) WHERE is_featured = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN bills.is_featured IS '��npH��';
