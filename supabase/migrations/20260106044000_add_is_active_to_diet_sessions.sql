-- Add is_active flag to diet_sessions table
-- This flag determines which session's bills are displayed on the top page
-- Only one session should be active at a time

ALTER TABLE diet_sessions
ADD COLUMN is_active boolean NOT NULL DEFAULT false;

-- Create a partial unique index to ensure only one active session at a time
CREATE UNIQUE INDEX idx_diet_sessions_single_active
ON diet_sessions (is_active)
WHERE is_active = true;

-- Add comment for documentation
COMMENT ON COLUMN diet_sessions.is_active IS 'Whether this session is the active one displayed on the top page. Only one session can be active at a time.';
