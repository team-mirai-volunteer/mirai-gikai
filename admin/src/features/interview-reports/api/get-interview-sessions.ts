import { createAdminClient } from "@mirai-gikai/supabase";
import type { InterviewSessionWithDetails } from "../types";

export const SESSIONS_PER_PAGE = 30;

export async function getInterviewSessions(
  billId: string,
  page = 1
): Promise<InterviewSessionWithDetails[]> {
  const supabase = createAdminClient();

  // まずinterview_configを取得
  const { data: config, error: configError } = await supabase
    .from("interview_configs")
    .select("id")
    .eq("bill_id", billId)
    .single();

  if (configError || !config) {
    return [];
  }

  // ページネーション計算
  const from = (page - 1) * SESSIONS_PER_PAGE;
  const to = from + SESSIONS_PER_PAGE - 1;

  // セッション一覧を取得
  const { data: sessions, error: sessionsError } = await supabase
    .from("interview_sessions")
    .select(
      `
      *,
      interview_report(*)
    `
    )
    .eq("interview_config_id", config.id)
    .order("started_at", { ascending: false })
    .range(from, to);

  if (sessionsError || !sessions) {
    console.error("Failed to fetch interview sessions:", sessionsError);
    return [];
  }

  // 全セッションのメッセージ数を一括取得（N+1クエリ回避）
  const sessionIds = sessions.map((s) => s.id);
  const { data: messageCounts, error: countError } = await supabase
    .from("interview_messages")
    .select("interview_session_id")
    .in("interview_session_id", sessionIds);

  if (countError) {
    console.error("Failed to fetch message counts:", countError);
  }

  // セッションIDごとのメッセージ数をカウント
  const countMap = new Map<string, number>();
  for (const msg of messageCounts || []) {
    const id = msg.interview_session_id;
    countMap.set(id, (countMap.get(id) || 0) + 1);
  }

  // セッションにメッセージ数を付与
  const sessionsWithDetails: InterviewSessionWithDetails[] = sessions.map(
    (session) => {
      // interview_reportは配列で返ってくるので最初の要素を取得
      const report = Array.isArray(session.interview_report)
        ? session.interview_report[0] || null
        : session.interview_report;

      return {
        ...session,
        message_count: countMap.get(session.id) || 0,
        interview_report: report,
      };
    }
  );

  return sessionsWithDetails;
}

export async function getInterviewSessionsCount(
  billId: string
): Promise<number> {
  const supabase = createAdminClient();

  // まずinterview_configを取得
  const { data: config, error: configError } = await supabase
    .from("interview_configs")
    .select("id")
    .eq("bill_id", billId)
    .single();

  if (configError || !config) {
    return 0;
  }

  const { count, error } = await supabase
    .from("interview_sessions")
    .select("*", { count: "exact", head: true })
    .eq("interview_config_id", config.id);

  if (error) {
    console.error("Failed to fetch session count:", error);
    return 0;
  }

  return count || 0;
}
