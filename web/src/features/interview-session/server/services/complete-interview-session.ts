import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import { generateObject } from "ai";
import { getBillById } from "@/features/bills/server/loaders/get-bill-by-id";
import { getInterviewConfig } from "@/features/interview-config/server/loaders/get-interview-config";
import { interviewReportSchema } from "../../shared/schemas";
import type { InterviewReport } from "../../shared/types";
import { buildSummarySystemPrompt } from "../utils/build-interview-system-prompt";

const reportOutputSchema = interviewReportSchema;

type CompleteInterviewSessionParams = {
  sessionId: string;
  billId: string;
};

/**
 * インタビューを完了し、レポートを生成して保存する
 */
export async function completeInterviewSession({
  sessionId,
  billId,
}: CompleteInterviewSessionParams): Promise<InterviewReport> {
  const supabase = createAdminClient();

  // インタビュー設定・法案を取得
  const [interviewConfig, bill] = await Promise.all([
    getInterviewConfig(billId),
    getBillById(billId),
  ]);

  if (!interviewConfig) {
    throw new Error("Interview config not found");
  }

  // メッセージ履歴を取得
  const { data: messages, error: messagesError } = await supabase
    .from("interview_messages")
    .select("*")
    .eq("interview_session_id", sessionId)
    .order("created_at", { ascending: true });

  if (messagesError || !messages) {
    throw new Error(
      `Failed to fetch interview messages: ${messagesError?.message ?? "unknown"}`
    );
  }

  // 会話履歴を {role}: {content} 形式に変換
  const formattedMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // サマリ用プロンプトを構築（会話履歴を含む）
  const reportPrompt = buildSummarySystemPrompt({
    bill,
    interviewConfig,
    messages: formattedMessages,
  });

  const completion = await generateObject({
    model: "google/gemini-3-flash",
    prompt: reportPrompt,
    schema: reportOutputSchema,
  });

  const parsed = completion.object;

  // レポートを保存（UPSERT）
  const { data: report, error: upsertError } = await supabase
    .from("interview_report")
    .upsert(
      {
        interview_session_id: sessionId,
        summary: parsed.summary,
        stance: parsed.stance,
        role: parsed.role,
        role_description: parsed.role_description,
        opinions: parsed.opinions,
        scores: parsed.scores,
      },
      { onConflict: "interview_session_id" }
    )
    .select()
    .single();

  if (upsertError || !report) {
    throw new Error(
      `Failed to save interview report: ${upsertError?.message ?? "unknown"}`
    );
  }

  // セッションを完了
  const { error: sessionUpdateError } = await supabase
    .from("interview_sessions")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (sessionUpdateError) {
    throw new Error(
      `Failed to complete interview session: ${
        sessionUpdateError?.message ?? "unknown"
      }`
    );
  }

  return report;
}
