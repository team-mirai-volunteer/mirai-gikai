"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { billCreateSchema, type BillCreateInput } from "../types";
import { requireAdmin } from "@/features/auth/lib/auth-server";

export async function createBill(input: BillCreateInput) {
  try {
    // 管理者権限チェック
    await requireAdmin();

    // バリデーション
    const validatedData = billCreateSchema.parse(input);

    // status_noteがnullの場合は空文字に変換
    const insertData = {
      ...validatedData,
      status_note: validatedData.status_note || null,
      published_at: new Date(validatedData.published_at).toISOString(),
    };

    // Supabaseに挿入
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("bills")
      .insert(insertData)
      .select("id")
      .single();

    if (error) {
      throw new Error(`議案の作成に失敗しました: ${error.message}`);
    }

    // キャッシュをリフレッシュ
    revalidatePath("/bills");
  } catch (error) {
    console.error("Create bill error:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("議案の作成中にエラーが発生しました");
  }

  // 成功したら一覧ページへリダイレクト
  redirect("/bills");
}
