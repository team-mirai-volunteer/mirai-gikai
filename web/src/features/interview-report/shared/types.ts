import type { Database } from "@mirai-gikai/supabase";

export type InterviewReport =
  Database["public"]["Tables"]["interview_report"]["Row"];
export type InterviewReportInsert =
  Database["public"]["Tables"]["interview_report"]["Insert"];

export type InterviewSession =
  Database["public"]["Tables"]["interview_sessions"]["Row"];

export type StanceTypeEnum = Database["public"]["Enums"]["stance_type_enum"];

// 公開用のレポート型（セッション情報を含む）
export type PublicInterviewReport = InterviewReport & {
  interview_session: Pick<
    InterviewSession,
    "id" | "started_at" | "completed_at"
  >;
};

// 意見の型
export type Opinion = {
  title: string;
  content: string;
};

// フィルタータイプ
export type StanceFilterType = "all" | "for" | "against" | "other";

// スタンスの日本語ラベル
export const STANCE_LABELS: Record<StanceTypeEnum, string> = {
  for: "賛成",
  against: "反対",
  neutral: "中立",
  conditional_for: "条件付き賛成",
  conditional_against: "条件付き反対",
  considering: "検討中",
  continued_deliberation: "継続審議",
};

// フィルターラベル
export const FILTER_LABELS: Record<StanceFilterType, string> = {
  all: "ALL",
  for: "期待",
  against: "懸念",
  other: "期待も懸念も",
};

// スタンスからフィルタータイプへの変換
export function stanceToFilterType(
  stance: StanceTypeEnum | null
): StanceFilterType {
  if (!stance) return "other";
  if (stance === "for" || stance === "conditional_for") return "for";
  if (stance === "against" || stance === "conditional_against")
    return "against";
  return "other";
}
