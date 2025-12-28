import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import { generateText, Output } from "ai";
import { getBillById } from "@/features/bills/api/get-bill-by-id";
import { getInterviewConfig } from "@/features/interview-config/api/get-interview-config";
import { getInterviewQuestions } from "@/features/interview-config/api/get-interview-questions";
import { buildInterviewSystemPrompt } from "../lib/build-interview-system-prompt";
import type { InterviewMessage } from "../types";
import { interviewChatTextSchema } from "../types/schemas";

type GenerateInitialQuestionParams = {
  sessionId: string;
  billId: string;
  interviewConfigId: string;
};

/**
 * インタビューの最初の質問を生成して保存
 */
export async function generateInitialQuestion({
  sessionId,
  billId,
  interviewConfigId,
}: GenerateInitialQuestionParams): Promise<InterviewMessage | null> {
  try {
    // インタビュー設定と法案情報を取得
    const [interviewConfig, bill, questions] = await Promise.all([
      getInterviewConfig(billId),
      getBillById(billId),
      getInterviewQuestions(interviewConfigId),
    ]);

    if (!interviewConfig) {
      throw new Error("Interview config not found");
    }

    // プロンプトを構築
    const systemPrompt = buildInterviewSystemPrompt({
      bill,
      interviewConfig,
      questions,
    });

    // インタビュー開始の指示を追加（最初の質問にはクイックリプライを含める）
    const enhancedSystemPrompt = `${systemPrompt}\n\n## 重要: これはインタビューの開始です。ユーザーからのメッセージはありません。事前定義質問の最初の質問から始めてください。挨拶は簡潔に（1-2文程度）、すぐに最初の質問をしてください。最初の質問にクイックリプライが設定されている場合は、必ず quick_replies フィールドに含めてください。`;

    // メッセージ履歴なしで最初の質問を生成（構造化出力）
    const result = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: enhancedSystemPrompt,
      output: Output.object({ schema: interviewChatTextSchema }),
    });

    const generatedText = result.text;

    if (!generatedText?.trim()) {
      console.error("Generated question is empty");
      return null;
    }

    // 生成した質問を保存（result.textはすでにJSON文字列）
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("interview_messages")
      .insert({
        interview_session_id: sessionId,
        role: "assistant",
        content: generatedText,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to save initial question:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to generate initial question:", error);
    return null;
  }
}
