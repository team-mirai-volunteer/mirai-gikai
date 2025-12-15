-- Add slug column to diet_sessions table for URL-friendly identifiers
ALTER TABLE diet_sessions
ADD COLUMN slug TEXT UNIQUE;

-- Create index for slug lookups
CREATE INDEX idx_diet_sessions_slug ON diet_sessions(slug);

-- Add comment for documentation
COMMENT ON COLUMN diet_sessions.slug IS 'URL用のスラッグ（例: 219-rinji, 218-jokai）';

