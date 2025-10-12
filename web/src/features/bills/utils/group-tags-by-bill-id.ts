/**
 * bill_id ごとにタグをグループ化する
 * @param billTags - bills_tagsテーブルから取得したデータ
 * @returns bill_idをキーとしたタグのMap
 */
export function groupTagsByBillId(
  billTags: Array<{
    bill_id: string;
    tags: { id: string; label: string } | null;
  }>
): Map<string, Array<{ id: string; label: string }>> {
  return billTags.reduce((acc, bt) => {
    if (bt.tags) {
      const existing = acc.get(bt.bill_id) ?? [];
      acc.set(bt.bill_id, [...existing, bt.tags]);
    }
    return acc;
  }, new Map<string, Array<{ id: string; label: string }>>());
}
