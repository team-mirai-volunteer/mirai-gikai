import type { Database } from "@mirai-gikai/supabase";
import { z } from "zod";

// 既存の型を再利用
export type BillContent = Database["public"]["Tables"]["bill_contents"]["Row"];
export type BillContentUpdate =
  Database["public"]["Tables"]["bill_contents"]["Update"];

// 難易度レベルの型
export type DifficultyLevel = "easy" | "normal" | "hard";

// バリデーションスキーマ
export const billContentUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(200, "タイトルは200文字以内で入力してください"),
  summary: z
    .string()
    .min(1, "要約は必須です")
    .max(500, "要約は500文字以内で入力してください"),
  content: z
    .string()
    .min(1, "内容は必須です")
    .max(50000, "内容は50000文字以内で入力してください"),
});

export type BillContentUpdateInput = z.infer<typeof billContentUpdateSchema>;

// 3つの難易度レベル用の入力型
export const billContentsUpdateSchema = z.object({
  easy: billContentUpdateSchema,
  normal: billContentUpdateSchema,
  hard: billContentUpdateSchema,
});

export type BillContentsUpdateInput = z.infer<typeof billContentsUpdateSchema>;

// 難易度レベル設定
export const DIFFICULTY_LEVELS: { value: DifficultyLevel; label: string }[] = [
  { value: "easy", label: "やさしい" },
  { value: "normal", label: "ふつう" },
  { value: "hard", label: "むずかしい" },
];
