-- Add diet_session_id to bills table for linking bills to diet sessions
ALTER TABLE bills 
ADD COLUMN diet_session_id uuid REFERENCES diet_sessions(id) ON DELETE SET NULL;

-- Create index for querying bills by diet session
CREATE INDEX idx_bills_diet_session_id ON bills(diet_session_id);

-- Add comment for documentation
COMMENT ON COLUMN bills.diet_session_id IS '紐付けられた国会会期ID';

