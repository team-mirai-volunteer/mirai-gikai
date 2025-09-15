-- マイグレーション: billsテーブルから不要になったカラムを削除
-- bill_contentsテーブルに移行したため、以下のカラムが不要となった

-- headline, description, body_markdownカラムを削除
ALTER TABLE bills DROP COLUMN IF EXISTS headline;
ALTER TABLE bills DROP COLUMN IF EXISTS description;
ALTER TABLE bills DROP COLUMN IF EXISTS body_markdown;

-- コメント更新
COMMENT ON TABLE bills IS '議案の基本情報を格納するテーブル。コンテンツはbill_contentsテーブルで管理。';