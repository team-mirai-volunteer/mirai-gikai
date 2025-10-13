-- Add featured_priority column to tags table
ALTER TABLE tags
ADD COLUMN featured_priority integer DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN tags.featured_priority IS 'Featured表示の優先度（数値が小さいほど優先度が高い）。NULLの場合は非表示';

-- Create index for efficient featured tags queries
CREATE INDEX idx_tags_featured_priority ON tags(featured_priority) WHERE featured_priority IS NOT NULL;
