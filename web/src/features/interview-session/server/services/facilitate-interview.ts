import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";
import { getBillByIdAdmin } from "@/features/bills/server/loaders/get-bill-by-id-admin";
import { getInterviewConfigAdmin } from "@/features/interview-config/server/loaders/get-interview-config-admin";
import { getInterviewQuestions } from "@/features/interview-config/server/loaders/get-interview-questions";
import { AI_MODELS } from "@/lib/ai/models";
import {
  type FacilitatorMessage,
  parseMessageContent,
} from "../../client/utils/message-utils";
import { GLOBAL_INTERVIEW_MODE } from "../../shared/constants";
import { getInterviewMessages } from "../loaders/get-interview-messages";
import { getInterviewSession } from "../loaders/get-interview-session";

const facilitatorResultSchema = z.object({
  nextStage: z.enum(["chat", "summary", "summary_complete"]),
});

export type FacilitatorResult = z.infer<typeof facilitatorResultSchema> & {
  source: "algorithm" | "llm";
};

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
  const askedQuestionIds = new Set<string>();
  for (const m of dbMessages) {
    if (m.role === "assistant") {
      const { questionId } = parseMessageContent(m.content);
      if (questionId) {
        askedQuestionIds.add(questionId);
      }
    }
  }

  // 質問の進捗状況を計算
  const totalQuestions = questions.length;
  const completedQuestions = askedQuestionIds.size;
  const remainingQuestions = totalQuestions - completedQuestions;

  const mode = GLOBAL_INTERVIEW_MODE;

  // bulkモード専用の制御ロジック：
  // 事前定義質問が全て完了していても、深掘り質問が最低1つ行われるまではchatステージを継続
  if (mode === "bulk" && currentStage === "chat") {
    // 事前定義質問以外のassistantメッセージ（深掘り質問）をカウント
    const followUpQuestionsCount = dbMessages.filter(
      (m) =>
        m.role === "assistant" && !parseMessageContent(m.content).questionId
    ).length;

    // 深掘り質問が2つ以下の場合は、LLMを呼ばずにchatステージを継続
    if (followUpQuestionsCount <= 2) {
      return { nextStage: "chat", source: "algorithm" };
    }
  }

  // 完了した質問と未回答の質問をリスト化
  const completedQuestionsList = questions
    .filter((q) => askedQuestionIds.has(q.id))
    .map((q) => `- [ID: ${q.id}] ${q.question}`)
    .join("\n");

  const remainingQuestionsList = questions
    .filter((q) => !askedQuestionIds.has(q.id))
    .map((q) => `- [ID: ${q.id}] ${q.question}`)
    .join("\n");

  // 現在のステージに応じてプロンプトを調整
  let stageGuidance = "";
  if (currentStage === "chat") {
    stageGuidance = `現在のステージ: chat（インタビュー中）
- インタビューを継続する場合は nextStage を "chat" にしてください。
- 要約フェーズに移行すべきと判断した場合は nextStage を "summary" にしてください。
${
  mode === "bulk"
    ? `- **重要**: 現在は「一括回答優先モード」です。
- 事前質問の全回答を得たあと、ユーザーにフォローアップのために十分な深堀りをおこないます。このフェーズは nextStage を "chat" としてください。
- ユーザーに十分な深堀りをし終えたあとに summary に移行してください。このフェーズは nextStage を "summary" にしてください。
`
    : ""
}
- 必ず chat → summary の順に進むようにしてください。`;
  } else if (currentStage === "summary") {
    stageGuidance = `現在のステージ: summary（要約フェーズ）
- ユーザーがレポート内容に同意し、完了すべきと判断した場合は nextStage を "summary_complete" にしてください。
- まだ修正や追加の要約が必要な場合は nextStage を "summary" にしてください。
- 必ず summary → summary_complete の順に進むようにしてください。`;
  } else {
    // summary_complete の場合は判定不要（既に完了）
    stageGuidance = `現在のステージ: summary_complete（完了済み）
- このステージでは判定は不要です。nextStage を "summary_complete" にしてください。`;
  }

  const facilitatorPrompt = `
  あなたは熟練の半構造化デプスインタビューのファシリテーターです。
  あなたの目標は、以下を達成することです。
  - インタビューを進行させ、
  - 十分に深堀りを行い、
  - 深い考察を行い、
  - ユーザー独自の知見を抽出したうえで
  - 最終的に要約を生成すること

## あなたの役割（ファシリテーター）
- 以下の会話履歴を読み、インタビューの進行状況を判断してください。
${stageGuidance}

## 事前定義質問の進捗状況
- **全体**: ${totalQuestions}問中${completedQuestions}問完了（残り${remainingQuestions}問）

${
  completedQuestionsList
    ? `### 完了した事前定義質問
${completedQuestionsList}
`
    : ""
}
${
  remainingQuestionsList
    ? `### 未回答の事前定義質問
${remainingQuestionsList}
`
    : ""
}

## 終了判定の目安（chatステージの場合）
- ${mode === "loop" ? "事前定義質問を概ね終えた、または" : ""}十分な知見を得た
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

  console.log(facilitatorPrompt);
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
