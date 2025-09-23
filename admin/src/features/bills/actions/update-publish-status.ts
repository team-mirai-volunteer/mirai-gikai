"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import type { BillPublishStatus } from "../types";

interface UpdatePublishStatusResult {
  success: boolean;
  error?: string;
}

// フォームアクション用のラッパー関数
export async function togglePublishStatusAction(formData: FormData) {
  await requireAdmin();

  const billId = formData.get("billId") as string;
  const currentStatus = formData.get("currentStatus") as BillPublishStatus;

  if (!billId || !currentStatus) {
    throw new Error("必要なパラメータが不足しています");
  }

  const newStatus: BillPublishStatus =
    currentStatus === "published" ? "draft" : "published";

  const result = await _updateBillPublishStatus(billId, newStatus);

  if (!result.success) {
    throw new Error(result.error || "ステータスの更新に失敗しました");
  }

  // 同じページにリダイレクト
  redirect("/bills");
}

async function _updateBillPublishStatus(
  billId: string,
  publishStatus: BillPublishStatus
): Promise<UpdatePublishStatusResult> {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("bills")
      .update({ publish_status: publishStatus })
      .eq("id", billId);

    if (error) {
      console.error("Failed to update publish status:", error);
      return {
        success: false,
        error: "ステータスの更新に失敗しました",
      };
    }

    // 管理画面の議案一覧とwebサイトのキャッシュを更新
    revalidatePath("/bills");
    revalidatePath("/admin/bills", "page");

    return { success: true };
  } catch (error) {
    console.error("Error updating publish status:", error);
    return {
      success: false,
      error: "予期しないエラーが発生しました",
    };
  }
}
