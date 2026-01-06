"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateWebCache } from "@/lib/utils/cache-invalidation";

export type SetActiveDietSessionInput = {
  id: string;
};

export async function setActiveDietSession(input: SetActiveDietSessionInput) {
  try {
    await requireAdmin();

    const supabase = createAdminClient();

    // まず、既存のactiveセッションを全て非アクティブにする
    const { error: deactivateError } = await supabase
      .from("diet_sessions")
      .update({ is_active: false })
      .eq("is_active", true);

    if (deactivateError) {
      return {
        error: `既存のアクティブセッションの解除に失敗しました: ${deactivateError.message}`,
      };
    }

    // 指定されたセッションをアクティブにする
    const { data, error } = await supabase
      .from("diet_sessions")
      .update({ is_active: true })
      .eq("id", input.id)
      .select()
      .single();

    if (error) {
      return {
        error: `アクティブセッションの設定に失敗しました: ${error.message}`,
      };
    }

    await invalidateWebCache();
    return { data };
  } catch (error) {
    console.error("Set active diet session error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "アクティブセッションの設定中にエラーが発生しました" };
  }
}
