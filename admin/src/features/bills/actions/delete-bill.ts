"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/lib/auth-server";

export async function deleteBill(id: string) {
  try {
    await requireAdmin();

    const supabase = createAdminClient();

    // 議案を削除
    const { error } = await supabase.from("bills").delete().eq("id", id);

    if (error) {
      throw new Error(`議案の削除に失敗しました: ${error.message}`);
    }

    // キャッシュをリフレッシュ
    revalidatePath("/bills");
  } catch (error) {
    console.error("Delete bill error:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("議案の削除中にエラーが発生しました");
  }
}
