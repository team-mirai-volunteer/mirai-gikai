import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import { generateText } from "ai";
import { getBillById } from "@/features/bills/api/get-bill-by-id";
import type { BillWithContent } from "@/features/bills/types";
import { getInterviewConfig } from "@/features/interview-config/api/get-interview-config";
import { getInterviewQuestions } from "@/features/interview-config/api/get-interview-questions";
import type { InterviewMessage } from "../types";

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

    // インタビュー開始の指示を追加
    const enhancedSystemPrompt = `${systemPrompt}\n\n## 重要: これはインタビューの開始です。ユーザーからのメッセージはありません。事前定義質問の最初の質問から始めてください。挨拶は簡潔に（1-2文程度）、すぐに最初の質問をしてください。`;

    // メッセージ履歴なしで最初の質問を生成
    const result = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: enhancedSystemPrompt,
    });

    const generatedText = result.text;

    if (!generatedText.trim()) {
      console.error("Generated question is empty");
      return null;
    }

    // 生成した質問を保存
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

/**
 * インタビュー用システムプロンプトを構築
 */
function buildInterviewSystemPrompt({
  bill,
  interviewConfig,
  questions,
}: {
  bill: BillWithContent | null;
  interviewConfig: Awaited<ReturnType<typeof getInterviewConfig>>;
  questions: Awaited<ReturnType<typeof getInterviewQuestions>>;
}): string {
  const billName = bill?.name || "";
  const billTitle = bill?.bill_content?.title || "";
  const billSummary = bill?.bill_content?.summary || "";
  const billContent = bill?.bill_content?.content || "";
  const themes = interviewConfig?.themes || [];
  const knowledgeSource = interviewConfig?.knowledge_source || "";

  const questionsText = questions
    .map(
      (q, index) =>
        `${index + 1}. ${q.question}${q.instruction ? `\n   指示: ${q.instruction}` : ""}${q.quick_replies ? `\n   クイックリプライ: ${q.quick_replies.join(", ")}` : ""}`
    )
    .join("\n");

  return `あなたは法案についてのインタビューを行うAIアシスタントです。

## 法案情報
- 法案名: ${billName}
- 法案タイトル: ${billTitle}
- 法案要約: ${billSummary}
- 法案詳細: ${billContent}

## インタビューテーマ
${themes.length > 0 ? themes.map((t) => `- ${t}`).join("\n") : "（テーマ未設定）"}

## 知識ソース
${knowledgeSource || "（知識ソース未設定）"}

## 事前定義質問
以下の質問を会話の流れに応じて適切なタイミングで使用してください。質問は順番通りに使う必要はなく、会話の流れに応じて選んでください。

${questionsText || "（質問未設定）"}

## インタビューの進め方
1. 事前定義された質問を会話の流れに応じて適切なタイミングで使用してください
2. 質問にはクイックリプライが設定されている場合があります。ユーザーがクイックリプライを選択した場合は、その選択を尊重してください
3. ユーザーの回答に基づいて深掘り質問を生成してください
4. インタビューを完了するタイミング:
   - 全ての事前定義質問が完了した時
   - これ以上の知見収集が望めないと判断した時
   - ユーザーが終了を望んだ時
5. インタビュー完了時は、レポートを生成する旨を伝えてください

## 注意事項
- 丁寧で親しみやすい口調で話してください
- ユーザーの回答を尊重し、押し付けがましくならないようにしてください
- 法案に関する質問のみに集中してください`;
}
