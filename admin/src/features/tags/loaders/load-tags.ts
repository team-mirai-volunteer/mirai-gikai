import { createAdminClient } from "@mirai-gikai/supabase";
import type { TagWithBillCount } from "../types";

export async function loadTags(): Promise<TagWithBillCount[]> {
  const supabase = createAdminClient();

  // Supabase クエリで議案数をカウント
  const { data, error } = await supabase
    .from("tags")
    .select(
      `
      id,
      label,
      description,
      featured_priority,
      created_at,
      updated_at,
      bills_tags(count)
    `
    )
    .order("featured_priority", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`タグの取得に失敗しました: ${error.message}`);
  }

  // データを整形
  return (
    data?.map((tag) => ({
      id: tag.id,
      label: tag.label,
      description: tag.description,
      featured_priority: tag.featured_priority,
      created_at: tag.created_at,
      updated_at: tag.updated_at,
      bill_count: tag.bills_tags?.[0]?.count ?? 0,
    })) || []
  );
}
