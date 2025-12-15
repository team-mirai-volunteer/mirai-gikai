"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";
import type { CreateDietSessionInput } from "../types";

export async function createDietSession(input: CreateDietSessionInput) {
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

    // slug のバリデーション（半角英数字とハイフンのみ）
    if (input.slug && !/^[a-z0-9-]+$/.test(input.slug)) {
      return {
        error: "スラッグは半角英小文字、数字、ハイフンのみ使用できます",
      };
    }

    // 日付の妥当性チェック
    const startDate = new Date(input.start_date);
    const endDate = new Date(input.end_date);

    if (endDate < startDate) {
      return { error: "終了日は開始日以降の日付を指定してください" };
    }

    const { data, error } = await supabase
      .from("diet_sessions")
      .insert({
        name: input.name.trim(),
        slug: input.slug?.trim() || null,
        start_date: input.start_date,
        end_date: input.end_date,
      })
      .select()
      .single();

    if (error) {
      return { error: `国会会期の作成に失敗しました: ${error.message}` };
    }

    await invalidateWebCache();
    return { data };
  } catch (error) {
    console.error("Create diet session error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "国会会期の作成中にエラーが発生しました" };
  }
}
