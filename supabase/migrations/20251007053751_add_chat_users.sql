-- Create chat_users table to persist authenticated anonymous users

CREATE TABLE chat_users (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE chat_users IS 'AIチャットの匿名ユーザー情報を管理するテーブル';
COMMENT ON COLUMN chat_users.id IS 'Supabase匿名ユーザーID（auth.users.id）';

ALTER TABLE chat_users ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_chat_users_updated_at
    BEFORE UPDATE ON chat_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE POLICY "chat_users_select_self"
    ON chat_users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "chat_users_insert_self"
    ON chat_users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "chat_users_update_self"
    ON chat_users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

