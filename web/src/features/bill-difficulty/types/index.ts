import type { Database } from "@mirai-gikai/supabase";

// 難易度レベルのEnum
export type DifficultyLevelEnum =
  Database["public"]["Enums"]["difficulty_level_enum"];

// 難易度のラベル
export const DIFFICULTY_LABELS: Record<DifficultyLevelEnum, string> = {
  normal: "ふつう",
  hard: "難しい",
};

// 難易度の説明
export const DIFFICULTY_DESCRIPTIONS: Record<DifficultyLevelEnum, string> = {
  normal: "中学生レベルの内容",
  hard: "専門用語を含む詳細な内容",
};

// Cookie名とデフォルト値
export const DIFFICULTY_COOKIE_NAME = "bill_difficulty_level";
export const DEFAULT_DIFFICULTY: DifficultyLevelEnum = "normal";
