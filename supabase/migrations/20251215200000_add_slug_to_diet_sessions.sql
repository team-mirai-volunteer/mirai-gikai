-- Add slug and shugiin_url columns to diet_sessions table

-- Add slug column for URL-friendly identifiers
ALTER TABLE diet_sessions
ADD COLUMN slug TEXT UNIQUE;

-- Create index for slug lookups
CREATE INDEX idx_diet_sessions_slug ON diet_sessions(slug);

-- Add shugiin_url column for linking to official 衆議院 page
ALTER TABLE diet_sessions
ADD COLUMN shugiin_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN diet_sessions.slug IS 'URL用のスラッグ（例: 219-rinji, 218-jokai）';
COMMENT ON COLUMN diet_sessions.shugiin_url IS '衆議院の国会議案情報ページURL';
