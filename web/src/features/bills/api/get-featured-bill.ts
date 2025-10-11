import { createAdminClient } from "@mirai-gikai/supabase";
import type { BillWithContent } from "../types";

/**
 * 注目の議案を取得する
 * is_featured = true で公開済みの議案を最新順に取得
 */
export async function getFeaturedBills(): Promise<BillWithContent[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("bills")
    .select(
      `
      *,
      bill_content:bill_contents(id, title, summary),
      tags:bills_tags(
        tag:tags(
          id,
          label
        )
      )
    `
    )
    .eq("is_featured", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch featured bills:", error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // すべての議案のタグを一度に取得（N+1回避）
  const billIds = data.map((item: { id: string }) => item.id);
  const { data: allBillTags } = await supabase
    .from("bills_tags")
    .select("bill_id, tags(id, label)")
    .in("bill_id", billIds);

  // bill_id ごとにタグをグループ化
  const tagsByBillId = new Map<string, Array<{ id: string; label: string }>>();
  allBillTags?.forEach((bt: { bill_id: string; tags: unknown }) => {
    if (bt.tags) {
      const existing = tagsByBillId.get(bt.bill_id) || [];
      tagsByBillId.set(bt.bill_id, [
        ...existing,
        bt.tags as { id: string; label: string },
      ]);
    }
  });

  // データ構造を整形
  return data.map((item) => {
    return {
      ...item,
      bill_content: Array.isArray(item.bill_content)
        ? item.bill_content[0]
        : undefined,
      tags: tagsByBillId.get(item.id) || [],
    };
  }) as BillWithContent[];
}
