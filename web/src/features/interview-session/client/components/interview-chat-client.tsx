"use client";

import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { useAnonymousSupabaseUser } from "@/features/chat/client/hooks/use-anonymous-supabase-user";
import { useInterviewChat } from "../hooks/use-interview-chat";
import { InterviewChatInput } from "./interview-chat-input";
import { InterviewMessage } from "./interview-message";
import { QuickReplyButtons } from "./quick-reply-buttons";

interface InterviewChatClientProps {
  billId: string;
  interviewConfigId: string;
  sessionId: string;
  initialMessages: Array<{
    id: string;
    role: "assistant" | "user";
    content: string;
    created_at: string;
  }>;
}

export function InterviewChatClient({
  billId,
  interviewConfigId,
  sessionId,
  initialMessages,
}: InterviewChatClientProps) {
  // 匿名ユーザー認証
  useAnonymousSupabaseUser();

  const {
    input,
    setInput,
    stage,
    parsedInitialMessages,
    conversationMessages,
    isLoading,
    error,
    object,
    streamingReportData,
    isStreamingMessageCommitted,
    currentQuickReplies,
    isCompleting,
    completeError,
    completedReportId,
    handleSubmit,
    handleAgree,
    handleQuickReply,
  } = useInterviewChat({
    billId,
    interviewConfigId,
    sessionId,
    initialMessages,
  });

  return (
    <div className="flex flex-col h-screen py-12 pt-24 md:pt-12">
      <Conversation className="flex-1 overflow-y-auto">
        <ConversationContent className="flex flex-col gap-4">
          {/* 初期表示メッセージ */}
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

          {/* ストリーミング中のAIレスポンスを表示 */}
          {object && !isStreamingMessageCommitted && (
            <InterviewMessage
              key="streaming-assistant"
              message={{
                id: "streaming-assistant",
                role: "assistant",
                parts: [{ type: "text" as const, text: object.text ?? "" }],
              }}
              isStreaming={isLoading}
              report={streamingReportData}
            />
          )}

          {/* ローディング表示 */}
          {isLoading && !object && (
            <span className="text-sm text-gray-500">考え中...</span>
          )}

          {/* エラー表示 */}
          {error && (
            <div className="text-sm text-red-500">
              エラーが発生しました: {error.message}
            </div>
          )}

          {/* 完了メッセージ */}
          {stage === "summary_complete" && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
              <p className="font-medium">
                インタビューにご協力いただきありがとうございました！
                <br />
                インタビュー内容を提出に進めてください。
              </p>
            </div>
          )}

          {/* クイックリプライボタン */}
          {!isLoading && stage === "chat" && currentQuickReplies.length > 0 && (
            <QuickReplyButtons
              replies={currentQuickReplies}
              onSelect={handleQuickReply}
              disabled={isLoading}
            />
          )}
        </ConversationContent>
      </Conversation>

      {/* 入力エリア */}
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
            <InterviewChatInput
              input={input}
              onInputChange={setInput}
              onSubmit={handleSubmit}
              placeholder="レポートの修正要望があれば入力してください"
              isResponding={isLoading}
              error={error}
            />
          </>
        )}

        {stage === "summary_complete" && (
          <div className="mb-3 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                if (completedReportId) {
                  window.location.href = `/report/${completedReportId}`;
                }
              }}
              className="inline-flex items-center justify-center rounded-md bg-[#0F8472] px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-60"
            >
              インタビューの提出に進む
            </button>
          </div>
        )}

        {stage === "chat" && (
          <InterviewChatInput
            input={input}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            placeholder="AIに質問に回答する"
            isResponding={isLoading}
            error={error}
            showHint={parsedInitialMessages.length > 0 || !!object}
          />
        )}
      </div>
    </div>
  );
}
