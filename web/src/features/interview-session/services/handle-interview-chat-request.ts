import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getBillById } from "@/features/bills/api/get-bill-by-id";
import type { BillWithContent } from "@/features/bills/types";
import { getInterviewConfig } from "@/features/interview-config/api/get-interview-config";
import { getInterviewQuestions } from "@/features/interview-config/api/get-interview-questions";
import { createInterviewSession } from "@/features/interview-session/actions/create-interview-session";
import { getInterviewSession } from "@/features/interview-session/api/get-interview-session";
import type { InterviewChatMetadata } from "@/features/interview-session/types";

type InterviewChatRequestParams = {
  messages: UIMessage<InterviewChatMetadata>[];
  billId: string;
};

/**
 * インタビューチャットリクエストを処理してストリーミングレスポンスを返す
 */
export async function handleInterviewChatRequest({
  messages,
  billId,
}: InterviewChatRequestParams) {
  // インタビュー設定と法案情報を取得
  const [interviewConfig, bill] = await Promise.all([
    getInterviewConfig(billId),
    getBillById(billId),
  ]);

  if (!interviewConfig) {
    throw new Error("Interview config not found");
  }

  // セッション取得または作成
  let session = await getInterviewSession(interviewConfig.id);
  if (!session) {
    session = await createInterviewSession({
      interviewConfigId: interviewConfig.id,
    });
  }

  // 事前定義質問を取得
  const questions = await getInterviewQuestions(interviewConfig.id);

  // プロンプトを構築（コード内に記載）
  const systemPrompt = buildInterviewSystemPrompt({
    bill,
    interviewConfig,
    questions,
  });

  // 最新のメッセージを取得（ユーザーの送信メッセージ）
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage.role === "user") {
    // ユーザーメッセージを保存
    const userMessageText = lastMessage.parts
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("");

    if (userMessageText.trim()) {
      await saveInterviewMessage({
        sessionId: session.id,
        role: "user",
        content: userMessageText,
      });
    }
  }

  const model = "openai/gpt-4o-mini";

  // Generate streaming response
  try {
    const result = streamText({
      model,
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      onFinish: async (event) => {
        try {
          // AI応答を保存
          if (event.text) {
            await saveInterviewMessage({
              sessionId: session.id,
              role: "assistant",
              content: event.text,
            });
          }
        } catch (usageError) {
          console.error("Failed to save interview message:", usageError);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("LLM generation error:", error);
    throw new Error(
      `LLM generation failed: ${error instanceof Error ? error.message : String(error)}`
    );
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

/**
 * インタビューメッセージを保存
 */
async function saveInterviewMessage({
  sessionId,
  role,
  content,
}: {
  sessionId: string;
  role: "assistant" | "user";
  content: string;
}): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.from("interview_messages").insert({
    interview_session_id: sessionId,
    role,
    content,
  });

  if (error) {
    console.error("Failed to save interview message:", error);
    throw new Error(`Failed to save interview message: ${error.message}`);
  }
}
