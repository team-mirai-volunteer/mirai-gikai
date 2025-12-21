import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import { getChatSupabaseUser } from "@/features/chat/lib/supabase-server";
import type { InterviewMessage } from "../types";

export async function getInterviewMessages(
  sessionId: string
): Promise<InterviewMessage[]> {
  // 認可処理: バックエンド側でuserIdを取得し、セッションの所有者を確認
  const {
    data: { user },
    error: getUserError,
  } = await getChatSupabaseUser();

  if (getUserError || !user) {
    console.error("Failed to get user:", getUserError);
    return [];
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("interview_messages")
    .select("*")
    .eq("user_id", user.id)
    .eq("interview_session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch interview messages:", error);
    return [];
  }

  return data || [];
}
