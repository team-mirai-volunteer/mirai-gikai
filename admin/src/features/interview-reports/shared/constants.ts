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
  subject_expert: "専門的な有識者",
  work_related: "業務に関係する立場",
  daily_life_affected: "暮らしに影響を受ける立場",
  general_citizen: "一市民として関心を持つ",
};
