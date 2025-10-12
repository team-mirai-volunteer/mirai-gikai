"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import { invalidateDietSessionCache } from "@/lib/utils/cache-invalidation";
import type { DeleteDietSessionInput } from "../types";

export async function deleteDietSession(input: DeleteDietSessionInput) {
  try {
    await requireAdmin();

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("diet_sessions")
      .delete()
      .eq("id", input.id);

    if (error) {
      return { error: `国会会期の削除に失敗しました: ${error.message}` };
    }

    await invalidateDietSessionCache();
    return { success: true };
  } catch (error) {
    console.error("Delete diet session error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "国会会期の削除中にエラーが発生しました" };
  }
}
