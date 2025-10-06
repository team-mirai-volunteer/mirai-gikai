-- Add RLS policies for user_token_usage table
-- This allows server-side operations to manage token usage

-- Policy for service role to insert new records
CREATE POLICY "Service role can insert token usage"
ON user_token_usage
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy for service role to update records
CREATE POLICY "Service role can update token usage"
ON user_token_usage
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Policy for service role to select records
CREATE POLICY "Service role can select token usage"
ON user_token_usage
FOR SELECT
TO service_role
USING (true);
