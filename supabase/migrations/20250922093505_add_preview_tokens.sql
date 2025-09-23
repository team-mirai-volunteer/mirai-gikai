-- Create preview_tokens table for managing preview access
CREATE TABLE preview_tokens (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by TEXT
);

-- Create index for efficient token lookup
CREATE INDEX idx_preview_tokens_token ON preview_tokens(token);
CREATE INDEX idx_preview_tokens_bill_id ON preview_tokens(bill_id);
CREATE INDEX idx_preview_tokens_expires_at ON preview_tokens(expires_at);

-- Enable RLS
ALTER TABLE preview_tokens ENABLE ROW LEVEL SECURITY;

-- Add comment for documentation
COMMENT ON TABLE preview_tokens IS 'Preview tokens for bill access management';
COMMENT ON COLUMN preview_tokens.token IS 'Unique preview access token';
COMMENT ON COLUMN preview_tokens.expires_at IS 'Token expiration date (30 days)';