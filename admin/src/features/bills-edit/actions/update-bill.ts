"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { billUpdateSchema, type BillUpdateInput } from "../types";
import { requireAdmin } from "@/features/auth/lib/auth-server";

export async function updateBill(id: string, input: BillUpdateInput) {
  try {
    // 管理者権限チェック
    await requireAdmin();

    // バリデーション
    const validatedData = billUpdateSchema.parse(input);

    // Supabaseで更新
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("bills")
      .update({
        name: validatedData.name,
        status: validatedData.status,
        originating_house: validatedData.originating_house,
        status_note: validatedData.status_note,
        published_at: validatedData.published_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw new Error(`議案の更新に失敗しました: ${error.message}`);
    }

    // キャッシュをリフレッシュ
    revalidatePath("/bills");
    revalidatePath(`/bills/${id}/edit`);
  } catch (error) {
    console.error("Update bill error:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("議案の更新中にエラーが発生しました");
  }

  // 成功したら一覧ページへリダイレクト
  redirect("/bills");
}