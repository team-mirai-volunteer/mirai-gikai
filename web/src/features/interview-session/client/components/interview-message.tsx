import type { UIMessage } from "@ai-sdk/react";
import { SystemMessage } from "@/features/chat/client/components/system-message";
import { UserMessage } from "@/features/chat/client/components/user-message";
import type { InterviewReportData } from "../../shared/schemas";
import { InterviewReportView } from "./interview-report";

interface InterviewMessageProps {
  message: UIMessage;
  isStreaming?: boolean;
  report?: InterviewReportData | null;
}

export function InterviewMessage({
  message,
  isStreaming = false,
  report,
}: InterviewMessageProps) {
  if (message.role === "user") {
    return <UserMessage message={message} />;
  }

  return (
    <div className="space-y-2">
      <SystemMessage message={message} isStreaming={isStreaming} />
      {report && (
        <div className="mt-2">
          <InterviewReportView report={report} />
        </div>
      )}
    </div>
  );
}
