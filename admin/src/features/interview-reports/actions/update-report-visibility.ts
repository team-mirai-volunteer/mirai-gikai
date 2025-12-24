"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/lib/auth-server";

interface UpdateReportVisibilityResult {
  success: boolean;
  error?: string;
}

export async function updateReportVisibilityAction(
  formData: FormData
): Promise<UpdateReportVisibilityResult> {
  await requireAdmin();

  const reportId = formData.get("reportId") as string;
  const isPublic = formData.get("isPublic") === "true";
  const billId = formData.get("billId") as string;
  const sessionId = formData.get("sessionId") as string;

  if (!reportId) {
    return {
      success: false,
      error: "レポートIDが必要です",
    };
  }

  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("interview_report")
      .update({ is_public: isPublic })
      .eq("id", reportId);

    if (error) {
      console.error("Failed to update report visibility:", error);
      return {
        success: false,
        error: "公開状態の更新に失敗しました",
      };
    }

    // Revalidate the detail page and list page
    if (billId && sessionId) {
      revalidatePath(`/bills/${billId}/reports/${sessionId}`);
      revalidatePath(`/bills/${billId}/reports`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating report visibility:", error);
    return {
      success: false,
      error: "予期しないエラーが発生しました",
    };
  }
}
