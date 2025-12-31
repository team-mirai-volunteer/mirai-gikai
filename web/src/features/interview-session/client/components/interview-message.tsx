import type { UIMessage } from "@ai-sdk/react";
import Image from "next/image";
import { SystemMessage } from "@/features/chat/client/components/system-message";
import { UserMessage } from "@/features/chat/client/components/user-message";
import { InterviewReportView } from "@/features/interview-report/client/components/interview-report";
import type { InterviewReportData } from "../../shared/schemas";

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
    <div className="flex flex-col gap-3">
      <div className="flex-shrink-0">
        <Image
          src="/icons/ai-chat.svg"
          alt="AI"
          width={36}
          height={36}
          className="rounded-full"
        />
      </div>
      <div className="flex-1 space-y-2">
        <SystemMessage message={message} isStreaming={isStreaming} />
        {report && (
          <div className="mt-2">
            <InterviewReportView report={report} />
            <p className="text-sm font-medium mt-2">
              こちらの内容で問題ありませんか？違和感がある箇所があれば指摘してください。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
