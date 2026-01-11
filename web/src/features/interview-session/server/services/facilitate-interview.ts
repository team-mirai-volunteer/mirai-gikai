import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";
import { getBillByIdAdmin } from "@/features/bills/server/loaders/get-bill-by-id-admin";
import { getInterviewConfigAdmin } from "@/features/interview-config/server/loaders/get-interview-config-admin";
import { getInterviewQuestions } from "@/features/interview-config/server/loaders/get-interview-questions";
import { AI_MODELS } from "@/lib/ai/models";
import { logger } from "@/lib/logger";
import { GLOBAL_INTERVIEW_MODE } from "../../shared/constants";
import type { SimpleMessage } from "../../shared/types";
import { getInterviewMessages } from "../loaders/get-interview-messages";
import { getInterviewSession } from "../loaders/get-interview-session";
import { collectAskedQuestionIds } from "../utils/interview-logic";
import { bulkModeLogic } from "../utils/interview-logic/bulk-mode";
import { loopModeLogic } from "../utils/interview-logic/loop-mode";
import type { FacilitatorResult } from "../utils/interview-logic/types";

const facilitatorResultSchema = z.object({
  nextStage: z.enum(["chat", "summary", "summary_complete"]),
});

export type { FacilitatorResult };

const modeLogicMap = {
  bulk: bulkModeLogic,
  loop: loopModeLogic,
} as const;

type Params = {
  messages: SimpleMessage[];
  billId: string;
  currentStage?: "chat" | "summary" | "summary_complete";
};

/**
 * ファシリテーターLLM: 進行/終了/要約移行を判定する（要約生成は別APIで実行）
 *
 * モードに応じて適切なロジックにルーティングする
 */
export async function facilitateInterview({
  messages,
  billId,
  currentStage = "chat",
}: Params): Promise<FacilitatorResult> {
  const [interviewConfig, _bill] = await Promise.all([
    getInterviewConfigAdmin(billId),
    getBillByIdAdmin(billId),
  ]);

  if (!interviewConfig) {
    throw new Error("Interview config not found");
  }

  // セッションを取得
  const session = await getInterviewSession(interviewConfig.id);
  if (!session) {
    throw new Error("Interview session not found");
  }

  const questions = await getInterviewQuestions(interviewConfig.id);

  // DBから最新を含む全メッセージを取得
  // クライアントからのmessagesはassistantメッセージの内容（JSON）が不完全な場合があるため
  const dbMessages = await getInterviewMessages(session.id);

  // 既に聞いた質問IDを収集
  const askedQuestionIds = collectAskedQuestionIds(dbMessages);

  // 質問の進捗状況を計算
  const totalQuestions = questions.length;
  const completedQuestions = askedQuestionIds.size;
  const remainingQuestions = totalQuestions - completedQuestions;

  // モードに応じたロジックを取得
  const mode = GLOBAL_INTERVIEW_MODE;
  const logic = modeLogicMap[mode] ?? bulkModeLogic;

  // ファシリテーターパラメータを構築
  const facilitatorParams = {
    messages,
    currentStage,
    questions,
    askedQuestionIds,
    dbMessages,
    totalQuestions,
    completedQuestions,
    remainingQuestions,
  };

  // モード固有のアルゴリズム判定を試みる
  const algorithmResult = logic.checkProgress(facilitatorParams);
  if (algorithmResult) {
    return algorithmResult;
  }

  // アルゴリズム判定できなかった場合はLLMで判定
  const facilitatorPrompt = logic.buildFacilitatorPrompt(facilitatorParams);

  const conversationText = messages
    .map((m) => `${m.role === "assistant" ? "AI" : "User"}: ${m.content}`)
    .join("\n");

  logger.debug(facilitatorPrompt);
  const result = await generateText({
    model: AI_MODELS.gpt4o_mini,
    prompt: `${facilitatorPrompt}\n\n# 会話履歴\n${conversationText}`,
    output: Output.object({ schema: facilitatorResultSchema }),
  });

  return {
    ...result.output,
    source: "llm",
  };
}
