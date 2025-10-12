"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import type { CreateTagInput } from "../types";

export async function createTag(input: CreateTagInput) {
  try {
    await requireAdmin();

    const supabase = createAdminClient();

    // バリデーション
    if (!input.label || input.label.trim().length === 0) {
      return { error: "タグ名を入力してください" };
    }

    const { data, error } = await supabase
      .from("tags")
      .insert({ label: input.label.trim() })
      .select()
      .single();

    if (error) {
      // UNIQUE制約違反
      if (error.code === "23505") {
        return { error: "このタグ名は既に存在します" };
      }
      return { error: `タグの作成に失敗しました: ${error.message}` };
    }

    revalidatePath("/tags");
    return { data };
  } catch (error) {
    console.error("Create tag error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "タグの作成中にエラーが発生しました" };
  }
}
