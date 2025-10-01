"use server";

import { createAdminClient } from "@mirai-gikai/supabase";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/lib/auth-server";
import type { Bill, BillInsert } from "../types";

const supabase = createAdminClient();
/**
 * 議案を複製する
 * 元の議案とそのコンテンツを複製し、新しい議案として作成する
 */
export async function duplicateBill(billId: string) {
  await requireAdmin();

  // 元の議案を取得
  const originalBill = await _fetchOriginalBill(billId);
  if (!originalBill.success) {
    return originalBill;
  }

  // 新しい議案を作成
  const newBill = await _createDuplicateBill(originalBill.data);
  if (!newBill.success) {
    return newBill;
  }

  // コンテンツを複製
  const contentResult = await _duplicateContents(billId, newBill.data.id);
  if (!contentResult.success) {
    return contentResult;
  }

  revalidatePath("/bills");
  return { success: true, data: { billId: newBill.data.id } };
}

/**
 * 元の議案を取得
 */
async function _fetchOriginalBill(billId: string) {
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("id", billId)
    .single();

  if (error || !data) {
    console.error("Error fetching original bill:", error);
    return {
      success: false as const,
      error: "元の議案が見つかりません",
    };
  }

  return { success: true as const, data };
}

/**
 * 複製した議案を作成
 */
async function _createDuplicateBill(originalBill: Bill) {
  const { id: _, ...billWithoutId } = originalBill;

  const insertData: BillInsert = {
    ...billWithoutId,
    name: `${originalBill.name} (複製)`,
    publish_status: "draft", // 複製後は下書き状態
  };

  const { data, error } = await supabase
    .from("bills")
    .insert(insertData)
    .select("id")
    .single();

  if (error || !data) {
    console.error("Error creating new bill:", error);
    return {
      success: false as const,
      error: "新しい議案の作成に失敗しました",
    };
  }

  return { success: true as const, data };
}

/**
 * 議案のコンテンツを複製
 */
async function _duplicateContents(originalBillId: string, newBillId: string) {
  // 元のコンテンツを取得
  const { data: originalContents, error: fetchError } = await supabase
    .from("bill_contents")
    .select("*")
    .eq("bill_id", originalBillId);

  if (fetchError) {
    console.error("Error fetching contents:", fetchError);
    return {
      success: false as const,
      error: "コンテンツの取得に失敗しました",
    };
  }

  // コンテンツが存在しない場合は成功として扱う
  if (!originalContents || originalContents.length === 0) {
    return { success: true as const };
  }

  // コンテンツを複製用に整形
  const newContents = originalContents.map((content) => {
    const { id: _, bill_id: __, ...contentData } = content;
    return {
      ...contentData,
      bill_id: newBillId,
    };
  });

  // 新しいコンテンツを挿入
  const { error: insertError } = await supabase
    .from("bill_contents")
    .insert(newContents);

  if (insertError) {
    console.error("Error inserting duplicated contents:", insertError);
    return {
      success: false as const,
      error: "コンテンツの複製に失敗しました",
    };
  }

  return { success: true as const };
}
