"use client";

import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { useInterviewChat } from "../hooks/use-interview-chat";
import { InterviewChatInput } from "./interview-chat-input";
import { InterviewMessage } from "./interview-message";
import { InterviewSubmitSection } from "./interview-submit-section";
import { InterviewSummaryInput } from "./interview-summary-input";
import { QuickReplyButtons } from "./quick-reply-buttons";

interface InterviewChatClientProps {
  billId: string;
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
  sessionId,
  initialMessages,
}: InterviewChatClientProps) {
  const {
    input,
    setInput,
    stage,
    messages,
    isLoading,
    error,
    object,
    streamingReportData,
    currentQuickReplies,
    completedReportId,
    handleSubmit,
    handleQuickReply,
    handleComplete,
  } = useInterviewChat({
    billId,
    initialMessages,
  });

  // ストリーミング中のメッセージがすでに会話履歴に追加されているかどうか
  const isStreamingMessageCommitted =
    object &&
    messages.some((m) => m.role === "assistant" && m.content === object.text);

  // ストリーミング中のメッセージを表示するかどうか
  const showStreamingMessage = object && !isStreamingMessageCommitted;

  return (
    <div className="flex flex-col h-screen py-12 pt-24 md:pt-12">
      <Conversation className="flex-1 overflow-y-auto">
        <ConversationContent className="flex flex-col gap-4">
          {/* 初期表示メッセージ */}
          {messages.length === 0 && !object && (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-bold leading-[1.8] text-[#1F2937]">
                法案についてのAIインタビューを開始します。
              </p>
              <p className="text-sm text-gray-600">
                あなたの意見や経験をお聞かせください。
              </p>
            </div>
          )}

          {/* メッセージ一覧を表示 */}
          {messages.map((message) => (
            <InterviewMessage
              key={message.id}
              message={{
                id: message.id,
                role: message.role,
                parts: [{ type: "text" as const, text: message.content }],
              }}
              isStreaming={false}
              report={message.report}
            />
          ))}

          {/* ストリーミング中のAIレスポンスを表示 */}
          {showStreamingMessage && (
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
          <InterviewSummaryInput
            sessionId={sessionId}
            billId={billId}
            input={input}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            onComplete={handleComplete}
            isLoading={isLoading}
            error={error}
          />
        )}

        {stage === "summary_complete" && completedReportId && (
          <InterviewSubmitSection
            sessionId={sessionId}
            reportId={completedReportId}
          />
        )}

        {stage === "chat" && (
          <InterviewChatInput
            input={input}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            placeholder="AIに質問に回答する"
            isResponding={isLoading}
            error={error}
            showHint={messages.length > 0 || !!object}
          />
        )}
      </div>
    </div>
  );
}
