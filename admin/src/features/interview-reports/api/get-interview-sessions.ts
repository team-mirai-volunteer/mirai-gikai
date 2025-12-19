import { createAdminClient } from "@mirai-gikai/supabase";
import type { InterviewSessionWithDetails } from "../types";

export async function getInterviewSessions(
  billId: string
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
    .order("started_at", { ascending: false });

  if (sessionsError || !sessions) {
    console.error("Failed to fetch interview sessions:", sessionsError);
    return [];
  }

  // 各セッションのメッセージ数を取得
  const sessionsWithDetails: InterviewSessionWithDetails[] = await Promise.all(
    sessions.map(async (session) => {
      const { count, error: countError } = await supabase
        .from("interview_messages")
        .select("*", { count: "exact", head: true })
        .eq("interview_session_id", session.id);

      if (countError) {
        console.error("Failed to fetch message count:", countError);
      }

      // interview_reportは配列で返ってくるので最初の要素を取得
      const report = Array.isArray(session.interview_report)
        ? session.interview_report[0] || null
        : session.interview_report;

      return {
        ...session,
        message_count: count || 0,
        interview_report: report,
      };
    })
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
