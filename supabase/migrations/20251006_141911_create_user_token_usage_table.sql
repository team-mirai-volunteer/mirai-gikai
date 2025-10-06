-- Create user_token_usage table for managing daily token limits
CREATE TABLE user_token_usage (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    token_used INTEGER NOT NULL DEFAULT 0,
    token_limit INTEGER NOT NULL DEFAULT 10000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_date UNIQUE(user_id, date)
);

-- Create indexes for efficient querying
CREATE INDEX idx_user_token_usage_user_id ON user_token_usage(user_id);
CREATE INDEX idx_user_token_usage_date ON user_token_usage(date);
CREATE INDEX idx_user_token_usage_user_date ON user_token_usage(user_id, date);

-- Create function to automatically update updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_token_usage_updated_at
    BEFORE UPDATE ON user_token_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE user_token_usage ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON TABLE user_token_usage IS 'ユーザーごとの日次トークン使用量を管理するテーブル';
COMMENT ON COLUMN user_token_usage.date IS '使用日(日次レート制限のキー)';
COMMENT ON COLUMN user_token_usage.token_used IS 'その日に使用したトークン数';
COMMENT ON COLUMN user_token_usage.token_limit IS 'その日の上限トークン数';
