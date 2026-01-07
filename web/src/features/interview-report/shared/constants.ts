/**
 * スタンスのラベルマッピング
 */
export const stanceLabels: Record<string, string> = {
  for: "期待",
  against: "懸念",
  neutral: "期待と懸念両方がある",
};

/**
 * インタビューレポートの役割の型
 */
export const interviewReportRoles = [
  "subject_expert",
  "work_related",
  "daily_life_affected",
  "general_citizen",
] as const;

export type InterviewReportRole = (typeof interviewReportRoles)[number];

/**
 * 役割のラベルマッピング
 */
export const roleLabels: Record<InterviewReportRole, string> = {
  subject_expert: "専門家",
  work_related: "仕事関係者",
  daily_life_affected: "生活影響を受ける人",
  general_citizen: "一般市民",
};
