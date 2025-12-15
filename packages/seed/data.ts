import type { Database } from "@mirai-gikai/supabase";

type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];
type MiraiStanceInsert =
  Database["public"]["Tables"]["mirai_stances"]["Insert"];
type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];
type BillsTagsInsert = Database["public"]["Tables"]["bills_tags"]["Insert"];
type DietSessionInsert =
  Database["public"]["Tables"]["diet_sessions"]["Insert"];

// 国会会期データ
export const dietSessions: DietSessionInsert[] = [
  {
    name: "第219回国会（臨時会）",
    slug: "219-rinji",
    start_date: "2025-10-21",
    end_date: "2025-12-17",
  },
];

// タグデータ
export const tags: TagInsert[] = [
  {
    label: "エネルギー・環境",
    description: "エネルギー政策、環境保護、気候変動対策に関する法案",
    featured_priority: 1,
  },
  {
    label: "子育て・教育",
    description: "子育て支援、教育政策、若者支援に関する法案",
    featured_priority: 2,
  },
  {
    label: "選挙・政治改革",
    description: "選挙制度、政治改革、民主主義の強化に関する法案",
    featured_priority: 3,
  },
];

export const bills: BillInsert[] = [
  {
    name: "ガソリン税暫定税率廃止法案",
    originating_house: "HR",
    status: "in_originating_house",
    status_note: "衆議院で審議中",
    published_at: "2025-08-01T09:00:00+09:00",
    publish_status: "published",
    is_featured: true,
  },
  {
    name: "こども家庭庁予算大幅増額法案",
    originating_house: "HC",
    status: "in_receiving_house",
    status_note: "参議院で可決、衆議院へ送付",
    published_at: "2025-01-20T10:00:00+09:00",
    publish_status: "published",
    is_featured: true,
  },
  {
    name: "18歳選挙権完全実施法案",
    originating_house: "HR",
    status: "introduced",
    status_note: "衆議院に提出済み",
    published_at: "2025-02-01T09:00:00+09:00",
    publish_status: "published",
    is_featured: false,
  },
  {
    name: "学校給食無償化促進法案",
    originating_house: "HC",
    status: "enacted",
    status_note: "両院で可決、4月から実施",
    published_at: "2025-01-10T09:00:00+09:00",
    publish_status: "published",
    is_featured: false,
  },
  {
    name: "中学生・高校生向けプログラミング教育必修化法案",
    originating_house: "HR",
    status: "rejected",
    status_note: "衆議院本会議で否決",
    published_at: "2024-11-15T10:00:00+09:00",
    publish_status: "published",
    is_featured: false,
  },
];

// 議案とタグの関連付け
// billsの順番: [ガソリン税, こども家庭庁, 18歳選挙権, 学校給食, プログラミング教育]
// tagsの順番: [エネルギー・環境, 子育て・教育, 選挙・政治改革]
export function createBillsTags(
  insertedBills: { id: string; name: string }[],
  insertedTags: { id: string; label: string }[]
): Omit<BillsTagsInsert, "id" | "created_at">[] {
  const billTagMap: { [billName: string]: string[] } = {
    "ガソリン税暫定税率廃止法案": ["エネルギー・環境"],
    "こども家庭庁予算大幅増額法案": ["子育て・教育"],
    "18歳選挙権完全実施法案": ["選挙・政治改革"],
    "学校給食無償化促進法案": ["子育て・教育"],
    "中学生・高校生向けプログラミング教育必修化法案": ["子育て・教育"],
  };

  const billsTags: Omit<BillsTagsInsert, "id" | "created_at">[] = [];

  for (const bill of insertedBills) {
    const tagLabels = billTagMap[bill.name] || [];
    for (const tagLabel of tagLabels) {
      const tag = insertedTags.find((t) => t.label === tagLabel);
      if (tag) {
        billsTags.push({
          bill_id: bill.id,
          tag_id: tag.id,
        });
      }
    }
  }

  return billsTags;
}

const miraiStancesData: Omit<MiraiStanceInsert, "bill_id">[] = [
  {
    // ガソリン税暫定税率廃止法案に対する見解
    type: "for",
    comment: `私たちは、家計の負担を軽くするこの法案に賛成します。

特に車が必要な地方の人たちには大きなメリットがあります。ただし、環境問題や道路整備の予算についても同時に考える必要があります。

電気自動車の普及促進など、環境に優しい対策もセットで進めるべきです。`,
  },
  {
    // こども家庭庁予算大幅増額法案に対する見解
    type: "for",
    comment: `少子化対策は国の最重要課題の一つです。この法案による児童手当の増額と保育の無償化は、子育て世代の経済的負担を大幅に軽減します。

特に第3子以降への手厚い支援は、出生率向上に効果的だと考えます。財源確保についても企業の子ども支援金など、社会全体で支える仕組みが評価できます。`,
  },
  {
    // 18歳選挙権完全実施法案に対する見解
    type: "for",
    comment: `18歳選挙権が導入されても、若者の投票率が低いままでは意味がありません。

この法案による主権者教育の充実と投票環境の改善は、民主主義の質を高める重要な取り組みです。デジタルネイティブ世代に合わせた情報提供の現代化も評価できます。`,
  },
  {
    // 学校給食無償化促進法案に対する見解
    type: "for",
    comment: `学校給食の無償化は、子育て支援と教育の充実を同時に実現する重要な政策です。

全ての子どもが質の高い食事を平等に受けられることは、健康格差の解消にもつながります。地産地消の推進により地域経済の活性化も期待できます。`,
  },
  {
    // プログラミング教育必修化法案に対する見解
    type: "against",
    comment: `デジタル人材の育成は重要ですが、準備不足での拙速な必修化には反対です。

教員の養成、設備の整備、カリキュラムの検討など、十分な準備期間が必要です。段階的な導入を検討し、質の高いプログラミング教育を実現すべきです。`,
  },
];

export function createMiraiStances(
  insertedBills: { id: string; name: string }[]
): MiraiStanceInsert[] {
  return miraiStancesData.map((stance, index) => ({
    ...stance,
    bill_id: insertedBills[index]?.id || "",
  }));
}
