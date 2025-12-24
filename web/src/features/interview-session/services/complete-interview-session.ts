import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import { generateObject } from "ai";
import { getBillById } from "@/features/bills/api/get-bill-by-id";
import { getInterviewConfig } from "@/features/interview-config/api/get-interview-config";
import { getInterviewQuestions } from "@/features/interview-config/api/get-interview-questions";
import { buildInterviewSystemPrompt } from "../lib/build-interview-system-prompt";
import type { InterviewReport } from "../types";
import { interviewReportSchema } from "../types/schemas";

const reportOutputSchema = interviewReportSchema;

type CompleteInterviewSessionParams = {
  sessionId: string;
  interviewConfigId: string;
  billId: string;
};

/**
 * インタビューを完了し、レポートを生成して保存する
 */
export async function completeInterviewSession({
  sessionId,
  interviewConfigId,
  billId,
}: CompleteInterviewSessionParams): Promise<InterviewReport> {
  const supabase = createAdminClient();

  // インタビュー設定・法案・質問を取得
  const [interviewConfig, bill, questions] = await Promise.all([
    getInterviewConfig(billId),
    getBillById(billId),
    getInterviewQuestions(interviewConfigId),
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

  // プロンプトを構築
  const systemPrompt = buildInterviewSystemPrompt({
    bill,
    interviewConfig,
    questions,
  });

  const reportPrompt = `${systemPrompt}

## あなたの役割
これまでのインタビュー内容を要約し、ユーザーのスタンスや役割を推定したレポートを生成してください。

## 留意点
- summaryは簡潔に1-3文で要約してください。
- stanceはfor/against/neutralから選択してください。
- opinionsは重要な論点をタイトルと内容で列挙してください（最大3件程度）。`;

  // ユーザーメッセージのテキスト連結をインプットに含める
  const messagesText = messages
    .map((m) => `${m.role === "assistant" ? "AI" : "User"}: ${m.content}`)
    .join("\n");

  const completion = await generateObject({
    model: "openai/gpt-4o-mini",
    prompt: `${reportPrompt}\n\n# インタビュー履歴\n${messagesText}`,
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
