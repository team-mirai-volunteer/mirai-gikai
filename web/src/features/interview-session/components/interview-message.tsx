import type { UIMessage } from "@ai-sdk/react";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { SystemMessage } from "@/features/chat/components/system-message";
import { UserMessage } from "@/features/chat/components/user-message";

interface InterviewMessageProps {
  message: UIMessage;
  isStreaming?: boolean;
}

export function InterviewMessage({
  message,
  isStreaming = false,
}: InterviewMessageProps) {
  if (message.role === "user") {
    return <UserMessage message={message} />;
  }

  return <SystemMessage message={message} isStreaming={isStreaming} />;
}
