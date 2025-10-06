-- Add RLS policies for authenticated users (including anonymous users)
-- to manage their own token usage

-- Policy for authenticated users to insert their own token usage records
CREATE POLICY "Users can insert their own token usage"
ON user_token_usage
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for authenticated users to select their own token usage records
CREATE POLICY "Users can select their own token usage"
ON user_token_usage
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for authenticated users to update their own token usage records
CREATE POLICY "Users can update their own token usage"
ON user_token_usage
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
