import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import { getChatSupabaseUser } from "@/features/chat/lib/supabase-server";
import type { InterviewReport } from "../types";

export type InterviewReportWithSessionInfo = InterviewReport & {
  bill_id: string;
  session_started_at: string;
  session_completed_at: string | null;
};

/**
 * レポートIDからインタビューレポートと関連情報を取得
 * 認可チェック: セッションの所有者のみがレポートを取得できる
 */
export async function getInterviewReportById(
  reportId: string
): Promise<InterviewReportWithSessionInfo | null> {
  // 認可処理: バックエンド側でuserIdを取得
  const {
    data: { user },
    error: getUserError,
  } = await getChatSupabaseUser();

  if (getUserError || !user) {
    console.error("Failed to get user:", getUserError);
    return null;
  }

  const supabase = createAdminClient();

  // レポートとセッション、interview_configを結合して取得
  const { data: report, error: reportError } = await supabase
    .from("interview_report")
    .select(
      "*, interview_sessions(user_id, started_at, completed_at, interview_configs(bill_id))"
    )
    .eq("id", reportId)
    .single();

  if (reportError || !report) {
    console.error("Failed to fetch interview report:", reportError);
    return null;
  }

  // セッション情報を取得
  const session = report.interview_sessions as {
    user_id: string;
    started_at: string;
    completed_at: string | null;
    interview_configs: { bill_id: string } | null;
  } | null;

  if (!session) {
    console.error("Session not found for report");
    return null;
  }

  // 認可チェック: セッションの所有者と現在のユーザーが一致するか
  if (session.user_id !== user.id) {
    console.error("Unauthorized access to interview report");
    return null;
  }

  // interview_configsからbill_idを取得
  if (!session.interview_configs) {
    console.error("Interview config not found for session");
    return null;
  }

  // レポートデータを返す
  const { interview_sessions: _, ...reportData } = report;
  return {
    ...reportData,
    bill_id: session.interview_configs.bill_id,
    session_started_at: session.started_at,
    session_completed_at: session.completed_at,
  };
}
