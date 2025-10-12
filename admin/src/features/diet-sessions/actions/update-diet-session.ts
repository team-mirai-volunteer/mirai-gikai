"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import type { UpdateDietSessionInput } from "../types";

export async function updateDietSession(input: UpdateDietSessionInput) {
  try {
    await requireAdmin();

    const supabase = createAdminClient();

    // バリデーション
    if (!input.name || input.name.trim().length === 0) {
      return { error: "国会名を入力してください" };
    }

    if (!input.start_date) {
      return { error: "開始日を入力してください" };
    }

    if (!input.end_date) {
      return { error: "終了日を入力してください" };
    }

    // 日付の妥当性チェック
    const startDate = new Date(input.start_date);
    const endDate = new Date(input.end_date);

    if (endDate < startDate) {
      return { error: "終了日は開始日以降の日付を指定してください" };
    }

    const { data, error } = await supabase
      .from("diet_sessions")
      .update({
        name: input.name.trim(),
        start_date: input.start_date,
        end_date: input.end_date,
      })
      .eq("id", input.id)
      .select()
      .single();

    if (error) {
      return { error: `国会会期の更新に失敗しました: ${error.message}` };
    }

    await invalidateWebCache();
    return { data };
  } catch (error) {
    console.error("Update diet session error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "国会会期の更新中にエラーが発生しました" };
  }
}
