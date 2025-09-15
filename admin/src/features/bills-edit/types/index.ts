import type { Database } from "@mirai-gikai/supabase";
import { z } from "zod";

// 既存の型を再利用
export type Bill = Database["public"]["Tables"]["bills"]["Row"];
export type BillUpdate = Database["public"]["Tables"]["bills"]["Update"];

// バリデーションスキーマ
export const billUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "議案名は必須です")
    .max(200, "議案名は200文字以内で入力してください"),
  status: z.enum([
    "introduced",
    "in_originating_house",
    "in_receiving_house",
    "enacted",
    "rejected",
  ]),
  originating_house: z.enum(["HR", "HC"]),
  status_note: z
    .string()
    .max(500, "ステータス備考は500文字以内で入力してください")
    .nullable(),
  published_at: z.string().min(1, "公開日時は必須です"),
});

export type BillUpdateInput = z.infer<typeof billUpdateSchema>;

// ステータスのラベル定義
export const BILL_STATUS_OPTIONS = [
  { value: "introduced", label: "提出済み" },
  { value: "in_originating_house", label: "提出院審議中" },
  { value: "in_receiving_house", label: "送付院審議中" },
  { value: "enacted", label: "成立" },
  { value: "rejected", label: "否決" },
] as const;

// 提出院のラベル定義
export const ORIGINATING_HOUSE_OPTIONS = [
  { value: "HR", label: "衆議院" },
  { value: "HC", label: "参議院" },
] as const;
