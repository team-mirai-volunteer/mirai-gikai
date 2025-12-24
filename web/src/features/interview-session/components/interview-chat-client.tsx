"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputBody,
  PromptInputError,
  PromptInputHint,
  type PromptInputMessage,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { useAnonymousSupabaseUser } from "@/features/chat/hooks/use-anonymous-supabase-user";
import {
  type InterviewReportData,
  interviewChatResponseSchema,
} from "@/features/interview-session/types/schemas";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { InterviewMessage } from "./interview-message";

interface InterviewChatClientProps {
  billId: string;
  interviewConfigId: string;
  sessionId: string;
  initialMessages: Array<{
    id: string;
    role: "assistant" | "user";
    content: string;
    created_at: string;
    report?: InterviewReportData | null;
  }>;
}

// 会話メッセージの型定義
type ConversationMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  report?: InterviewReportData | null;
};

// レポートが有効かどうかを判定（空オブジェクトや全てnullの場合はfalse）
function isValidReport(
  report: InterviewReportData | null | undefined
): report is InterviewReportData {
  if (!report) return false;
  // 少なくとも1つのプロパティが有効な値を持っているか確認
  return !!(
    report.summary ||
    report.stance ||
    report.role ||
    report.role_description ||
    (report.opinions && report.opinions.length > 0)
  );
}

// JSONとして保存されたメッセージをパースして、textとreportに分離する
function parseMessageContent(content: string): {
  text: string;
  report: InterviewReportData | null;
} {
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed === "object" && parsed !== null && "text" in parsed) {
      const report = parsed.report ?? null;
      return {
        text: parsed.text ?? "",
        report: isValidReport(report) ? report : null,
      };
    }
  } catch {
    // JSONでない場合はそのままテキストとして扱う
  }
  return { text: content, report: null };
}

export function InterviewChatClient({
  billId,
  interviewConfigId,
  sessionId,
  initialMessages,
}: InterviewChatClientProps) {
  // 匿名ユーザー認証
  useAnonymousSupabaseUser();

  // 初期メッセージをパースして、textとreportに分離
  const parsedInitialMessages = initialMessages.map((msg) => {
    if (msg.role === "assistant") {
      const { text, report } = parseMessageContent(msg.content);
      return { ...msg, content: text, report: msg.report ?? report };
    }
    return msg;
  });

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDesktop = useIsDesktop();

  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [stage, setStage] = useState<"chat" | "summary" | "summary_complete">(
    "chat"
  );
  // 会話履歴を保持するstate（initialMessages以降のメッセージを蓄積）
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([]);

  // useObjectフックを使用（streamObjectの結果を受け取る）
  const { object, submit, isLoading, error } = useObject({
    api: "/api/interview/chat",
    schema: interviewChatResponseSchema,
    onFinish: ({ object: finishedObject, error: finishedError }) => {
      if (finishedError) {
        console.error("chat error", finishedError);
        return;
      }
      // ストリーミング完了時にAIメッセージを履歴に追加
      if (finishedObject) {
        const { text, report } = finishedObject;
        const convertedReport = report
          ? {
              summary: report.summary ?? null,
              stance: report.stance ?? null,
              role: report.role ?? null,
              role_description: report.role_description ?? null,
              opinions: report.opinions
                ? report.opinions
                    .filter((op): op is NonNullable<typeof op> => op != null)
                    .map((op) => ({
                      title: op.title ?? "",
                      content: op.content ?? "",
                    }))
                    .filter((op) => op.title || op.content)
                : [],
            }
          : null;

        setConversationMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: text ?? "",
            // 空のレポートは除外
            report: isValidReport(convertedReport) ? convertedReport : null,
          },
        ]);
      }
    },
  });

  const isResponding = isLoading;

  // objectからreportを取得（PartialObjectをInterviewReportDataに変換）
  const rawReportData: InterviewReportData | null = object?.report
    ? {
        summary: object.report.summary ?? null,
        stance: object.report.stance ?? null,
        role: object.report.role ?? null,
        role_description: object.report.role_description ?? null,
        opinions: object.report.opinions
          ? object.report.opinions
              .filter((op): op is NonNullable<typeof op> => op != null)
              .map((op) => ({
                title: op.title ?? "",
                content: op.content ?? "",
              }))
              .filter((op) => op.title || op.content)
          : [],
      }
    : null;

  // 空のレポートは除外
  const reportData = isValidReport(rawReportData) ? rawReportData : null;

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);

    if (!hasText || isResponding) {
      return;
    }

    // summary_completeフェーズでは送信不可
    if (stage === "summary_complete") {
      return;
    }

    const userMessageText = message.text ?? "";
    const userMessageId = `user-${Date.now()}`;

    // ユーザーメッセージを会話履歴に追加
    setConversationMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        role: "user",
        content: userMessageText,
      },
    ]);

    // summaryフェーズではファシリテーターを呼ばず、直接チャットAPIを呼ぶ
    if (stage === "summary") {
      submit({
        messages: [
          ...parsedInitialMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          ...conversationMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          {
            role: "user" as const,
            content: userMessageText,
          },
        ],
        billId,
        currentStage: "summary",
      });
      // Reset form
      setInput("");
      return;
    }

    // 通常のチャットフェーズでは、送信前にファシリテーターAPIを同期呼び出し
    try {
      // Reset form
      setInput("");

      const res = await fetch("/api/interview/facilitate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...parsedInitialMessages.map((m) => ({
              id: m.id,
              role: m.role,
              parts: [{ type: "text" as const, text: m.content }],
              metadata: {
                interviewSessionId: sessionId,
                interviewConfigId,
                billId,
                currentStage: "chat",
              },
            })),
            ...conversationMessages.map((m) => ({
              id: m.id,
              role: m.role,
              parts: [{ type: "text" as const, text: m.content }],
              metadata: {
                interviewSessionId: sessionId,
                interviewConfigId,
                billId,
                currentStage: "chat",
              },
            })),
            {
              id: userMessageId,
              role: "user" as const,
              parts: [{ type: "text" as const, text: userMessageText }],
              metadata: {
                interviewSessionId: sessionId,
                interviewConfigId,
                billId,
                currentStage: "chat",
              },
            },
          ],
          billId,
          currentStage: "chat",
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          status: "continue" | "summary" | "summary_complete";
        };
        if (data.status === "summary") {
          setStage("summary");
          // summary判定後、自動的にチャットAPIをsummaryメタデータ付きで呼び出してレポート案を生成
          submit({
            messages: [
              ...parsedInitialMessages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              ...conversationMessages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              {
                role: "user" as const,
                content: userMessageText,
              },
            ],
            billId,
            currentStage: "summary",
          });
          return;
        }
      }
    } catch (err) {
      console.error("facilitate interview failed before send", err);
    }

    // 通常のチャットフェーズでのメッセージ送信
    submit({
      messages: [
        ...parsedInitialMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        ...conversationMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        {
          role: "user" as const,
          content: userMessageText,
        },
      ],
      billId,
      currentStage: "chat",
    });

    // Reset form
    setInput("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Auto-resize
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleAgree = async () => {
    setIsCompleting(true);
    setCompleteError(null);
    try {
      const res = await fetch("/api/interview/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          interviewConfigId,
          billId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to complete interview");
      }

      setStage("summary_complete");
      console.log("complete interview", res);
    } catch (err) {
      setCompleteError(
        err instanceof Error ? err.message : "Failed to complete interview"
      );
    } finally {
      setIsCompleting(false);
    }
  };

  console.log("stage", stage);

  return (
    <div className="flex flex-col h-screen py-12 pt-24 md:pt-12">
      <Conversation className="flex-1 overflow-y-auto">
        <ConversationContent className="flex flex-col gap-4">
          {parsedInitialMessages.length === 0 && !object && (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-bold leading-[1.8] text-[#1F2937]">
                法案についてのAIインタビューを開始します。
              </p>
              <p className="text-sm text-gray-600">
                あなたの意見や経験をお聞かせください。
              </p>
            </div>
          )}
          {/* 初期メッセージを表示 */}
          {parsedInitialMessages.map((message) => (
            <InterviewMessage
              key={message.id}
              message={{
                id: message.id,
                role: message.role,
                parts: [{ type: "text" as const, text: message.content }],
              }}
              isStreaming={false}
              report={message.report ?? null}
            />
          ))}
          {/* 会話履歴を表示（確定済みメッセージ） */}
          {conversationMessages.map((message) => (
            <InterviewMessage
              key={message.id}
              message={{
                id: message.id,
                role: message.role,
                parts: [{ type: "text" as const, text: message.content }],
              }}
              isStreaming={false}
              report={message.report ?? null}
            />
          ))}
          {/* ストリーミング中または最新のAIレスポンスを表示 */}
          {/* conversationMessagesに追加されるまでの間、objectを表示 */}
          {object &&
            !conversationMessages.some(
              (m) => m.role === "assistant" && m.content === object.text
            ) && (
              <InterviewMessage
                key="streaming-assistant"
                message={{
                  id: "streaming-assistant",
                  role: "assistant",
                  parts: [{ type: "text" as const, text: object.text ?? "" }],
                }}
                isStreaming={isLoading}
                report={reportData}
              />
            )}
          {isLoading && !object && (
            <span className="text-sm text-gray-500">考え中...</span>
          )}
          {error && (
            <div className="text-sm text-red-500">
              エラーが発生しました: {error.message}
            </div>
          )}
          {stage === "summary_complete" && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
              <p className="font-medium">
                インタビューにご協力いただきありがとうございました！
                <br />
                インタビュー内容を提出に進めてください。
              </p>
            </div>
          )}
        </ConversationContent>
      </Conversation>

      <div className="px-6 pb-4 pt-2">
        {stage === "summary" && (
          <>
            <div className="mb-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleAgree}
                disabled={isCompleting}
                className="inline-flex items-center justify-center rounded-md bg-[#0F8472] px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-60"
              >
                {isCompleting ? "送信中..." : "レポート内容に同意する"}
              </button>
              {completeError && (
                <p className="text-sm text-red-500">{completeError}</p>
              )}
            </div>
            <PromptInput
              onSubmit={handleSubmit}
              className="flex items-end gap-2.5 py-2 pl-6 pr-4 bg-white rounded-[50px] border-2 border-transparent bg-clip-padding divide-y-0"
              style={{
                backgroundImage:
                  "linear-gradient(white, white), linear-gradient(-45deg, rgba(188, 236, 211, 1) 0%, rgba(100, 216, 198, 1) 100%)",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
              }}
            >
              <PromptInputBody className="flex-1">
                <PromptInputTextarea
                  ref={textareaRef}
                  onChange={handleInputChange}
                  value={input}
                  placeholder="レポートの修正要望があれば入力してください"
                  rows={1}
                  submitOnEnter={isDesktop}
                  className="!min-h-0 min-w-0 wrap-anywhere text-sm font-medium leading-[1.5em] tracking-[0.01em] placeholder:text-[#AEAEB2] placeholder:font-medium placeholder:leading-[1.5em] placeholder:tracking-[0.01em] placeholder:no-underline border-none focus:ring-0 bg-transparent shadow-none !py-2 !px-0"
                />
              </PromptInputBody>
              <button
                type="submit"
                disabled={!input || isResponding}
                className="flex-shrink-0 w-10 h-10 disabled:opacity-50"
              >
                <Image
                  src="/icons/send-button-icon.svg"
                  alt="送信"
                  width={40}
                  height={40}
                  className="w-full h-full"
                />
              </button>
            </PromptInput>
            <PromptInputError
              status={error ? "error" : undefined}
              error={error}
            />
          </>
        )}
        {stage === "summary_complete" && (
          <div className="mb-3 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                window.location.href = `/bills/${billId}/interview/report/${sessionId}`;
              }}
              className="inline-flex items-center justify-center rounded-md bg-[#0F8472] px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-60"
            >
              インタビューの提出に進む
            </button>
          </div>
        )}
        {stage === "chat" && (
          <>
            <PromptInput
              onSubmit={handleSubmit}
              className="flex items-end gap-2.5 py-2 pl-6 pr-4 bg-white rounded-[50px] border-2 border-transparent bg-clip-padding divide-y-0"
              style={{
                backgroundImage:
                  "linear-gradient(white, white), linear-gradient(-45deg, rgba(188, 236, 211, 1) 0%, rgba(100, 216, 198, 1) 100%)",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
              }}
            >
              <PromptInputBody className="flex-1">
                <PromptInputTextarea
                  ref={textareaRef}
                  onChange={handleInputChange}
                  value={input}
                  placeholder="AIに質問に回答する"
                  rows={1}
                  submitOnEnter={isDesktop}
                  className="!min-h-0 min-w-0 wrap-anywhere text-sm font-medium leading-[1.5em] tracking-[0.01em] placeholder:text-[#AEAEB2] placeholder:font-medium placeholder:leading-[1.5em] placeholder:tracking-[0.01em] placeholder:no-underline border-none focus:ring-0 bg-transparent shadow-none !py-2 !px-0"
                />
              </PromptInputBody>
              <button
                type="submit"
                disabled={!input || isResponding}
                className="flex-shrink-0 w-10 h-10 disabled:opacity-50"
              >
                <Image
                  src="/icons/send-button-icon.svg"
                  alt="送信"
                  width={40}
                  height={40}
                  className="w-full h-full"
                />
              </button>
            </PromptInput>
            <PromptInputError
              status={error ? "error" : undefined}
              error={error}
            />
            {(parsedInitialMessages.length > 0 || object) && (
              <PromptInputHint />
            )}
          </>
        )}
      </div>
    </div>
  );
}
