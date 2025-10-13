-- Add description column to tags table
ALTER TABLE tags
ADD COLUMN description text DEFAULT NULL;

COMMENT ON COLUMN tags.description IS 'Tag description text';
