import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";
import { getBillByIdAdmin } from "@/features/bills/server/loaders/get-bill-by-id-admin";
import { getInterviewConfigAdmin } from "@/features/interview-config/server/loaders/get-interview-config-admin";
import { getInterviewQuestions } from "@/features/interview-config/server/loaders/get-interview-questions";
import { AI_MODELS } from "@/lib/ai/models";
import type { FacilitatorMessage } from "../../client/utils/message-utils";
import { GLOBAL_INTERVIEW_MODE } from "../../shared/constants";
import { buildInterviewSystemPrompt } from "../utils/build-interview-system-prompt";

const facilitatorResultSchema = z.object({
  status: z.enum(["continue", "summary", "summary_complete"]),
});

export type FacilitatorResult = z.infer<typeof facilitatorResultSchema>;

type Params = {
  messages: FacilitatorMessage[];
  billId: string;
  currentStage?: "chat" | "summary" | "summary_complete";
};

/**
 * ファシリテーターLLM: 進行/終了/要約移行を判定する（要約生成は別APIで実行）
 */
export async function facilitateInterview({
  messages,
  billId,
  currentStage = "chat",
}: Params): Promise<FacilitatorResult> {
  const [interviewConfig, bill] = await Promise.all([
    getInterviewConfigAdmin(billId),
    getBillByIdAdmin(billId),
  ]);

  if (!interviewConfig) {
    throw new Error("Interview config not found");
  }

  const questions = await getInterviewQuestions(interviewConfig.id);

  const systemPrompt = buildInterviewSystemPrompt({
    bill,
    interviewConfig,
    questions,
  });

  const mode = GLOBAL_INTERVIEW_MODE;

  // 現在のステージに応じてプロンプトを調整
  let stageGuidance = "";
  if (currentStage === "chat") {
    stageGuidance = `現在のステージ: chat（インタビュー中）
- インタビューを継続する場合は status を "continue" にしてください。
- 要約フェーズに移行すべきと判断した場合は status を "summary" としてください。
${
  mode === "bulk"
    ? "- **重要**: 現在は「一括深掘りモード」です。以下の事前定義質問がすべて消化されるまで、絶対に summary に移行しないでください。\n"
    : ""
}
- 必ず chat → summary の順に進むようにしてください。`;
  } else if (currentStage === "summary") {
    stageGuidance = `現在のステージ: summary（要約フェーズ）
- ユーザーがレポート内容に同意し、完了すべきと判断した場合は status を "summary_complete" としてください。
- まだ修正や追加の要約が必要な場合は status を "continue" としてください。
- 必ず summary → summary_complete の順に進むようにしてください。`;
  } else {
    // summary_complete の場合は判定不要（既に完了）
    stageGuidance = `現在のステージ: summary_complete（完了済み）
- このステージでは判定は不要です。`;
  }

  const facilitatorPrompt = `${systemPrompt}

## あなたの役割（ファシリテーター）
- 以下の会話履歴を読み、インタビューの進行状況を判断してください。
${stageGuidance}

## 終了判定の目安（chatステージの場合）
- 事前定義質問を概ね終えた、または十分な知見を得た
- これ以上の深掘りが難しい
- ユーザーが終了を希望した

## 完了判定の目安（summaryステージの場合）
- ユーザーがレポート内容に同意した
- レポートの修正要望がなく、完了を希望している

## 注意
- JSON以外のテキストを出力しないでください。
- ステージ遷移は必ず chat → summary → summary_complete の順に進むようにしてください。
`;

  const conversationText = messages
    .map((m) => `${m.role === "assistant" ? "AI" : "User"}: ${m.content}`)
    .join("\n");

  const result = await generateText({
    model: AI_MODELS.gpt4o_mini,
    prompt: `${facilitatorPrompt}\n\n# 会話履歴\n${conversationText}`,
    output: Output.object({ schema: facilitatorResultSchema }),
  });

  return result.output;
}
