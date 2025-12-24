import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import { getChatSupabaseUser } from "@/features/chat/lib/supabase-server";
import type { InterviewReport } from "../types";

/**
 * セッションIDからインタビューレポートを取得
 * 認可チェック: セッションの所有者のみがレポートを取得できる
 */
export async function getInterviewReport(
  sessionId: string
): Promise<InterviewReport | null> {
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

  // セッションの所有者を確認
  const { data: session, error: sessionError } = await supabase
    .from("interview_sessions")
    .select("user_id")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    console.error("Failed to fetch interview session:", sessionError);
    return null;
  }

  // 認可チェック: セッションの所有者と現在のユーザーが一致するか
  if (session.user_id !== user.id) {
    console.error("Unauthorized access to interview report");
    return null;
  }

  // レポートを取得
  const { data: report, error: reportError } = await supabase
    .from("interview_report")
    .select("*")
    .eq("interview_session_id", sessionId)
    .single();

  if (reportError) {
    console.error("Failed to fetch interview report:", reportError);
    return null;
  }

  return report;
}
