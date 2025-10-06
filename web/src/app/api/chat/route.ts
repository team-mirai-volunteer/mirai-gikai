import {
  convertToModelMessages,
  simulateReadableStream,
  streamText,
  type UIMessage,
} from "ai";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/types";
import type { BillWithContent } from "@/features/bills/types";
import { createClient } from "@/lib/supabase/server";
import { checkTokenLimit } from "@/features/chat/actions/check-token-limit";
import { updateTokenUsage } from "@/features/chat/actions/update-token-usage";

async function _mockResponse(_req: Request) {
  const randomMessageId = Math.random().toString(36).substring(2, 10);
  return new Response(
    simulateReadableStream({
      initialDelayInMs: 1000, // 最初の遅延
      chunkDelayInMs: 200, // 各チャンク間の遅延
      chunks: [
        `data: {"type":"start","messageId":"${randomMessageId}"}\n\n`,
        `data: {"type":"text-start","id":"text-1"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"本日は、生成AIに関する新しい取り組みが"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"各地で発表されました。"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":" 特に注目を集めているのは、"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"日本語に最適化された大規模言語モデルで、"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"従来に比べて大幅に精度が向上しています。"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":" 研究者によれば、"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"長文生成だけでなく要約や推論の分野でも"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"高いパフォーマンスを示しており、"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"ビジネスや教育の現場での活用が"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"期待されています。"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":" また、"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"国内のスタートアップ企業も積極的に"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"この分野に参入しており、"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"今後数年で市場は急速に拡大する見込みです。"}\n\n`,
        `data: {"type":"text-end","id":"text-1"}\n\n`,
        `data: {"type":"finish"}\n\n`,
        `data: [DONE]\n\n`,
      ],
    }).pipeThrough(new TextEncoderStream()),
    {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "x-vercel-ai-ui-message-stream": "v1",
      },
    }
  );
}

export async function POST(req: Request) {
  const {
    messages,
  }: {
    messages: UIMessage<{
      billContext: BillWithContent;
      difficultyLevel: string;
    }>[];
  } = await req.json();

  // Extract bill context and difficulty level from the first user message data if available
  const billContext = messages[0]?.metadata?.billContext;
  const difficultyLevel = (messages[0]?.metadata?.difficultyLevel ||
    "normal") as DifficultyLevelEnum;

  // 匿名ユーザーIDを取得
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  // トークン制限チェック
  const { canUse, remaining } = await checkTokenLimit(userId);

  if (!canUse) {
    return new Response(
      JSON.stringify({
        error: "Token limit reached",
        message: "トークンの上限に達しました。",
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 難易度に応じたシステムプロンプトの設定
  const getDifficultyInstructions = (level: DifficultyLevelEnum) => {
    switch (level) {
      case "hard":
        return `
        回答の難易度：難しい（専門用語を含む詳細な内容）
        - 専門用語を正確に使用し、詳細で網羅的な説明をしてください
        - 法律的な背景や制度的な文脈も含めて説明してください
        - 複数の観点から議案を分析し、深い考察を提供してください
        - 関連する法令や制度についても言及してください
        `;
      default: // "normal"
        return `
        回答の難易度：ふつう（中学生レベルの内容）
        - 中学生が理解できる程度の語彙と表現を使用してください
        - 専門用語は使用してもよいが、必ず説明を併記してください
        - 適度に詳しく、かつ分かりやすい説明を心がけてください
        - 具体例を交えて説明してください
        `;
    }
  };

  const systemPrompt = `
    あなたは日本の議案について説明する専門的なアシスタントです。

    議案情報：
    - 名称: ${billContext?.name}
    - タイトル: ${billContext?.bill_content?.title || ""}
    - 要約: ${billContext?.bill_content?.summary || ""}
    - 詳細: ${billContext?.bill_content?.content || ""}

    ${getDifficultyInstructions(difficultyLevel)}

    ルール：
    1. この議案に関する質問にのみ回答する
    2. 上記の難易度設定に従って説明する
    3. 正確で客観的な情報を提供する
    4. 政治的に中立な立場を保つ
    5. 回答は600文字以下を目安にしつつ、フレンドリーかつサポーティブな口調で行う
    6. 回答が難しい場合は、その旨を丁寧に伝える
    7. メッセージのおわりは、会話の深堀りをサポートするような文章で締めくくる
    7. ただし、毎回質問で終わると、不自然になるので、適宜調整する
  `;

  // Vercel AI Gatewayを通じて直接モデルを指定
  const result = streamText({
    model: "openai/gpt-4o-mini",
    // "openai/gpt-5-mini" Context 400K Input Tokens $0.25/M Output Tokens $2.00/M Cache Read Tokens $0.03/M
    // "openai/gpt-4o-mini" Context 128K Input Tokens $0.15/M Output Tokens $0.60/M Cache Read Tokens $0.07/M
    // "deepseek/deepseek-v3.1" Context 164K Input Tokens $0.20/M Output Tokens $0.80/M
    system: systemPrompt,
    messages: convertToModelMessages(messages),
    onFinish: async ({ usage }) => {
      // トークン使用量を記録（非同期）
      if (usage) {
        await updateTokenUsage(userId, usage.promptTokens, usage.completionTokens);
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
