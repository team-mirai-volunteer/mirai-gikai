import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import type { InterviewReport } from "../../shared/types";
import {
  getAuthenticatedUser,
  isSessionOwner,
} from "../utils/verify-session-ownership";

export type InterviewReportWithSessionInfo = InterviewReport & {
  bill_id: string;
  session_started_at: string;
  session_completed_at: string | null;
  is_public_by_user: boolean;
};

/**
 * レポートIDからインタビューレポートと関連情報を取得
 * 認可チェック: セッションの所有者のみがレポートを取得できる
 */
export async function getInterviewReportById(
  reportId: string
): Promise<InterviewReportWithSessionInfo | null> {
  const authResult = await getAuthenticatedUser();

  if (!authResult.authenticated) {
    console.error("Failed to get user:", authResult.error);
    return null;
  }

  const { userId } = authResult;
  const supabase = createAdminClient();

  // レポートとセッション、interview_configを結合して取得
  const { data: report, error: reportError } = await supabase
    .from("interview_report")
    .select(
      "*, interview_sessions(user_id, started_at, completed_at, is_public_by_user, interview_configs(bill_id))"
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
    is_public_by_user: boolean;
    interview_configs: { bill_id: string } | null;
  } | null;

  if (!session) {
    console.error("Session not found for report");
    return null;
  }

  // 認可チェック: セッションの所有者と現在のユーザーが一致するか
  if (!isSessionOwner(session.user_id, userId)) {
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
    is_public_by_user: session.is_public_by_user,
  };
}
