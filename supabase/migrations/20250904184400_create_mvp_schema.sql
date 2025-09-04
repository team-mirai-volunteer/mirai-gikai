-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE house_enum AS ENUM ('HR', 'HC');
CREATE TYPE bill_status_enum AS ENUM (
    'introduced',
    'in_originating_house',
    'in_receiving_house',
    'enacted',
    'rejected'
);
CREATE TYPE stance_type_enum AS ENUM ('for', 'against', 'neutral');
CREATE TYPE chat_role_enum AS ENUM ('user', 'system', 'assistant');

-- Create bills table
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    headline TEXT,
    description TEXT,
    originating_house house_enum NOT NULL,
    status bill_status_enum NOT NULL,
    status_note TEXT,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    body_markdown TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create mirai_stances table
CREATE TABLE mirai_stances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL UNIQUE REFERENCES bills(id) ON DELETE CASCADE,
    type stance_type_enum NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create chats table
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    user_id UUID,
    role chat_role_enum NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for bills table
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_published_at ON bills(published_at DESC);
CREATE INDEX idx_bills_originating_house ON bills(originating_house);

-- Create indexes for mirai_stances table
CREATE INDEX idx_mirai_stances_bill_id ON mirai_stances(bill_id);
CREATE INDEX idx_mirai_stances_type ON mirai_stances(type);

-- Create indexes for chats table
CREATE INDEX idx_chats_bill_id ON chats(bill_id);
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_created_at ON chats(created_at DESC);
CREATE INDEX idx_chats_bill_user ON chats(bill_id, user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mirai_stances_updated_at BEFORE UPDATE ON mirai_stances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (all access denied by default)
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE mirai_stances ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- No policies are created, so all access is denied by default
-- Access will only be possible using Supabase Service Role Key from server-side

-- Add comments to tables and columns for documentation
COMMENT ON TABLE bills IS '議案の基本情報を管理するテーブル';
COMMENT ON COLUMN bills.originating_house IS '発議院（HR:衆議院, HC:参議院）';
COMMENT ON COLUMN bills.status IS '議案のステータス';
COMMENT ON COLUMN bills.published_at IS 'サービスでの議案公開日時';

COMMENT ON TABLE mirai_stances IS 'チームみらい（安野議員）の公式スタンスを記録するテーブル';
COMMENT ON COLUMN mirai_stances.type IS 'スタンス（for:賛成, against:反対, neutral:中立）';

COMMENT ON TABLE chats IS 'AIとの対話履歴を管理するテーブル';
COMMENT ON COLUMN chats.user_id IS 'ユーザーID（Supabase匿名認証）';
COMMENT ON COLUMN chats.role IS 'メッセージの送信者役割';