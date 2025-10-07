-- Create chat_users table to track anonymous chat usage

CREATE TABLE chat_users (
    id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    token_used INTEGER NOT NULL DEFAULT 0,
    token_remaining INTEGER NOT NULL DEFAULT 10000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT chat_users_pkey PRIMARY KEY (id, date)
);

COMMENT ON TABLE chat_users IS 'AIチャットの匿名ユーザーごとの日次利用状況を記録するテーブル';
COMMENT ON COLUMN chat_users.id IS 'Supabase匿名ユーザーID（auth.users.id）';
COMMENT ON COLUMN chat_users.date IS '利用日（JST換算）';
COMMENT ON COLUMN chat_users.token_used IS '当日利用したトークン数';
COMMENT ON COLUMN chat_users.token_remaining IS '当日残り利用可能なトークン数';

ALTER TABLE chat_users
    ADD CONSTRAINT chat_users_auth_user_fk
    FOREIGN KEY (id) REFERENCES auth.users (id)
    ON DELETE CASCADE;

CREATE INDEX idx_chat_users_id ON chat_users (id);

ALTER TABLE chat_users ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_chat_users_updated_at
    BEFORE UPDATE ON chat_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "chat_users_select_self"
    ON chat_users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "chat_users_update_self"
    ON chat_users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

