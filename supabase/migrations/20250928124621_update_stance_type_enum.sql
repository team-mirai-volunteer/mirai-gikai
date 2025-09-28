-- スタンスタイプの拡張
-- 既存: for (賛成), against (反対), neutral (中立)
-- 追加: conditional_for (条件付き賛成), conditional_against (条件付き反対), considering (検討中)

-- 新しいENUM型を作成
CREATE TYPE stance_type_enum_new AS ENUM (
    'for',                    -- 賛成
    'against',                -- 反対
    'neutral',                -- 中立
    'conditional_for',        -- 条件付き賛成
    'conditional_against',    -- 条件付き反対
    'considering'            -- 検討中
);

-- 既存のカラムを新しいENUM型に変更
ALTER TABLE mirai_stances
    ALTER COLUMN type TYPE stance_type_enum_new
    USING type::text::stance_type_enum_new;

-- 古いENUM型を削除
DROP TYPE stance_type_enum;

-- 新しいENUM型の名前を元の名前に変更
ALTER TYPE stance_type_enum_new RENAME TO stance_type_enum;

-- コメントを更新
COMMENT ON COLUMN mirai_stances.type IS 'スタンス（for:賛成, against:反対, neutral:中立, conditional_for:条件付き賛成, conditional_against:条件付き反対, considering:検討中）';