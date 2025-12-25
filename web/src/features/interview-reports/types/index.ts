import type { Database } from "@mirai-gikai/supabase";

export type InterviewReport =
  Database["public"]["Tables"]["interview_report"]["Row"];

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
