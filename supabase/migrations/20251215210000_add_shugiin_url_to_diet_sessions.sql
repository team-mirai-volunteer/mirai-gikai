-- Add shugiin_url column to diet_sessions table for linking to official 衆議院 page
ALTER TABLE diet_sessions
ADD COLUMN shugiin_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN diet_sessions.shugiin_url IS '衆議院の国会議案情報ページURL';

