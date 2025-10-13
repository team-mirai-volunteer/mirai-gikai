"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import type { UpdateTagInput } from "../types";

export async function updateTag(input: UpdateTagInput) {
  try {
    await requireAdmin();

    const supabase = createAdminClient();

    // バリデーション
    if (!input.label || input.label.trim().length === 0) {
      return { error: "タグ名を入力してください" };
    }

    const { data, error } = await supabase
      .from("tags")
      .update({
        label: input.label.trim(),
        description: input.description,
        featured_priority: input.featured_priority,
      })
      .eq("id", input.id)
      .select()
      .single();

    if (error) {
      // UNIQUE制約違反
      if (error.code === "23505") {
        return { error: "このタグ名は既に存在します" };
      }
      // レコードが見つからない
      if (error.code === "PGRST116") {
        return { error: "タグが見つかりません" };
      }
      return { error: `タグの更新に失敗しました: ${error.message}` };
    }

    revalidatePath("/tags");
    return { data };
  } catch (error) {
    console.error("Update tag error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "タグの更新中にエラーが発生しました" };
  }
}
