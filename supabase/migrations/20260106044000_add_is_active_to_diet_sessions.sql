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

-- Atomic function to set a diet session as active
-- This ensures only one session can be active at a time, avoiding race conditions
CREATE OR REPLACE FUNCTION set_active_diet_session(target_session_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Single atomic UPDATE: set is_active based on whether id matches target
  UPDATE diet_sessions
  SET is_active = (id = target_session_id);
END;
$$;
