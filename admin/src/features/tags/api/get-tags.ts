import { createAdminClient } from "@mirai-gikai/supabase";
import type { TagWithBillCount } from "../types";

export async function getTags(): Promise<TagWithBillCount[]> {
  const supabase = createAdminClient();

  // Supabase クエリで議案数をカウント
  const { data, error } = await supabase
    .from("tags")
    .select(
      `
      id,
      label,
      created_at,
      updated_at,
      bills_tags(count)
    `
    )
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`タグの取得に失敗しました: ${error.message}`);
  }

  // データを整形
  return (
    data?.map((tag) => ({
      id: tag.id,
      label: tag.label,
      created_at: tag.created_at,
      updated_at: tag.updated_at,
      bill_count: tag.bills_tags?.[0]?.count ?? 0,
    })) || []
  );
}
