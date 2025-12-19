import type { Database } from "@mirai-gikai/supabase";

type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];
type MiraiStanceInsert =
  Database["public"]["Tables"]["mirai_stances"]["Insert"];
type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];
type BillsTagsInsert = Database["public"]["Tables"]["bills_tags"]["Insert"];
type DietSessionInsert =
  Database["public"]["Tables"]["diet_sessions"]["Insert"];
type InterviewConfigInsert =
  Database["public"]["Tables"]["interview_configs"]["Insert"];
type InterviewQuestionInsert =
  Database["public"]["Tables"]["interview_questions"]["Insert"];
type InterviewSessionInsert =
  Database["public"]["Tables"]["interview_sessions"]["Insert"];
type InterviewMessageInsert =
  Database["public"]["Tables"]["interview_messages"]["Insert"];
type InterviewReportInsert =
  Database["public"]["Tables"]["interview_report"]["Insert"];

// 国会会期データ
export const dietSessions: DietSessionInsert[] = [
  {
    name: "第219回国会（臨時会）",
    slug: "219-rinji",
    shugiin_url:
      "https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/menu.htm",
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
    status: "enacted",
    status_note: "両院で可決、成立",
    published_at: "2025-01-20T10:00:00+09:00",
    publish_status: "published",
    is_featured: true,
  },
  {
    name: "18歳選挙権完全実施法案",
    originating_house: "HR",
    status: "rejected",
    status_note: "衆議院で否決",
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

// インタビュー設定を作成（最初の法案用）
export function createInterviewConfig(
  insertedBills: { id: string; name: string }[]
): Omit<InterviewConfigInsert, "id" | "created_at" | "updated_at"> | null {
  const targetBill = insertedBills[0];
  if (!targetBill) return null;

  return {
    bill_id: targetBill.id,
    status: "public",
    themes: ["賛否", "理由"],
    knowledge_source: `この法案についてあなたの意見を聞かせてください。`,
  };
}

// インタビュー質問を作成
export function createInterviewQuestions(
  interviewConfigId: string
): Omit<InterviewQuestionInsert, "id" | "created_at" | "updated_at">[] {
  return [
    {
      interview_config_id: interviewConfigId,
      question: "この法案に賛成ですか？反対ですか？",
      instruction: "ユーザーの立場を明確にしてください。",
      quick_replies: ["賛成", "反対", "どちらでもない"],
      question_order: 1,
    },
    {
      interview_config_id: interviewConfigId,
      question: "その理由を教えてください。",
      instruction: "具体的な理由を引き出してください。",
      quick_replies: null,
      question_order: 2,
    },
  ];
}

// インタビューセッションを作成（5パターン × 20回 = 100件）
export function createInterviewSessions(
  interviewConfigId: string
): Omit<InterviewSessionInsert, "id" | "created_at" | "updated_at">[] {
  const now = new Date();
  const sessions: Omit<
    InterviewSessionInsert,
    "id" | "created_at" | "updated_at"
  >[] = [];

  // 20回ループして100件作成
  for (let i = 0; i < 20; i++) {
    const baseOffset = i * 86400000 * 3; // 3日ずつずらす

    // パターン1: 完了 + レポートあり（賛成）
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 1).padStart(12, "0")}`,
      started_at: new Date(now.getTime() - baseOffset - 3600000).toISOString(),
      completed_at: new Date(
        now.getTime() - baseOffset - 3000000
      ).toISOString(),
    });

    // パターン2: 完了 + レポートあり（反対）
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 2).padStart(12, "0")}`,
      started_at: new Date(now.getTime() - baseOffset - 7200000).toISOString(),
      completed_at: new Date(
        now.getTime() - baseOffset - 6600000
      ).toISOString(),
    });

    // パターン3: 完了 + レポートあり（中立）
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 3).padStart(12, "0")}`,
      started_at: new Date(now.getTime() - baseOffset - 10800000).toISOString(),
      completed_at: new Date(
        now.getTime() - baseOffset - 10200000
      ).toISOString(),
    });

    // パターン4: 完了したけどレポート未作成
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 4).padStart(12, "0")}`,
      started_at: new Date(now.getTime() - baseOffset - 14400000).toISOString(),
      completed_at: new Date(
        now.getTime() - baseOffset - 13800000
      ).toISOString(),
    });

    // パターン5: 進行中（未完了、レポートなし）
    sessions.push({
      interview_config_id: interviewConfigId,
      user_id: `00000000-0000-0000-0000-${String(i * 5 + 5).padStart(12, "0")}`,
      started_at: new Date(now.getTime() - baseOffset - 1800000).toISOString(),
      completed_at: null,
    });
  }

  return sessions;
}

// インタビューメッセージを作成（5パターンをループ）
export function createInterviewMessages(
  sessionIds: string[]
): Omit<InterviewMessageInsert, "id" | "created_at">[] {
  const conversations = [
    // パターン1: 賛成（完了 + レポートあり）
    [
      { role: "assistant" as const, content: "この法案に賛成ですか？反対ですか？" },
      { role: "user" as const, content: "賛成です" },
      { role: "assistant" as const, content: "その理由を教えてください。" },
      { role: "user" as const, content: "なぜなら賛成だからです。国民のためになると思います。" },
      { role: "assistant" as const, content: "ありがとうございました。ご意見を承りました。" },
    ],
    // パターン2: 反対（完了 + レポートあり）
    [
      { role: "assistant" as const, content: "この法案に賛成ですか？反対ですか？" },
      { role: "user" as const, content: "反対です" },
      { role: "assistant" as const, content: "その理由を教えてください。" },
      { role: "user" as const, content: "財源が不明確だと思います。" },
      { role: "assistant" as const, content: "ありがとうございました。ご意見を承りました。" },
    ],
    // パターン3: どちらでもない（完了 + レポートあり）
    [
      { role: "assistant" as const, content: "この法案に賛成ですか？反対ですか？" },
      { role: "user" as const, content: "どちらでもないです" },
      { role: "assistant" as const, content: "その理由を教えてください。" },
      { role: "user" as const, content: "もっと情報が必要だと思います。" },
      { role: "assistant" as const, content: "ありがとうございました。ご意見を承りました。" },
    ],
    // パターン4: 完了したけどレポート未作成
    [
      { role: "assistant" as const, content: "この法案に賛成ですか？反対ですか？" },
      { role: "user" as const, content: "賛成です" },
      { role: "assistant" as const, content: "その理由を教えてください。" },
      { role: "user" as const, content: "良い法案だと思います。" },
      { role: "assistant" as const, content: "ありがとうございました。ご意見を承りました。" },
    ],
    // パターン5: 進行中（途中で離脱）
    [
      { role: "assistant" as const, content: "この法案に賛成ですか？反対ですか？" },
      { role: "user" as const, content: "うーん、ちょっと考えさせてください" },
    ],
  ];

  const messages: Omit<InterviewMessageInsert, "id" | "created_at">[] = [];

  sessionIds.forEach((sessionId, sessionIndex) => {
    // 5パターンをループ
    const patternIndex = sessionIndex % 5;
    const conversation = conversations[patternIndex];
    conversation.forEach((msg) => {
      messages.push({
        interview_session_id: sessionId,
        role: msg.role,
        content: msg.content,
      });
    });
  });

  return messages;
}

// インタビューレポートを作成（パターン1,2,3のみ = 5の倍数で0,1,2番目）
export function createInterviewReports(
  sessionIds: string[]
): Omit<InterviewReportInsert, "id" | "created_at" | "updated_at">[] {
  const reportTemplates = [
    {
      stance: "for" as const,
      summary: "この法案に賛成。国民のためになると考えている。",
      role: "一般市民",
      role_description: "法案の内容に賛同する市民",
      opinions: [{ title: "賛成理由", content: "国民のためになる" }],
    },
    {
      stance: "against" as const,
      summary: "財源の不明確さを理由に反対。",
      role: "一般市民",
      role_description: "財政面を懸念する市民",
      opinions: [{ title: "反対理由", content: "財源が不明確" }],
    },
    {
      stance: "neutral" as const,
      summary: "判断するにはより多くの情報が必要と考えている。",
      role: "一般市民",
      role_description: "慎重な判断を求める市民",
      opinions: [{ title: "態度保留理由", content: "情報不足" }],
    },
  ];

  const reports: Omit<
    InterviewReportInsert,
    "id" | "created_at" | "updated_at"
  >[] = [];

  // パターン1,2,3（5の倍数で0,1,2番目）のみレポートを作成
  // パターン4: 完了したけどレポート未作成
  // パターン5: 進行中（レポートなし）
  sessionIds.forEach((sessionId, index) => {
    const patternIndex = index % 5;
    if (patternIndex < 3) {
      reports.push({
        interview_session_id: sessionId,
        ...reportTemplates[patternIndex],
      });
    }
  });

  return reports;
}
