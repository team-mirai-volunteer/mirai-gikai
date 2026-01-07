import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { getBillDetailLink } from "@/features/interview-config/shared/utils/interview-links";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { getReportWithMessages } from "../loaders/get-report-with-messages";
import { stanceLabels } from "../../shared/constants";
import {
  calculateDuration,
  countCharacters,
  formatDateTime,
} from "../../shared/utils/report-utils";

interface ReportChatLogPageProps {
  reportId: string;
}

export async function ReportChatLogPage({ reportId }: ReportChatLogPageProps) {
  const data = await getReportWithMessages(reportId);

  if (!data) {
    notFound();
  }

  const { report, messages, bill } = data;
  const billName = bill.bill_content?.title || bill.name;
  const duration = calculateDuration(
    report.session_started_at,
    report.session_completed_at
  );
  const characterCount = countCharacters(messages);

  return (
    <div className="min-h-screen bg-[#F7F4F0]">
      {/* Header Section */}
      <div className="bg-white rounded-b-[32px] px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-800">
            インタビューレポート
          </h1>

          {/* Bill Name */}
          <div className="bg-[#F2F2F7] rounded-xl px-4 py-2">
            <p className="text-sm text-gray-800">{billName}</p>
          </div>

          {/* Summary Speech Bubble */}
          {report.summary && (
            <SpeechBubble>
              <p className="text-lg font-bold text-gray-800 leading-relaxed relative z-10 text-center">
                {report.summary}
              </p>
            </SpeechBubble>
          )}

          {/* Stance and Meta Info */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-3">
              {/* Stance */}
              {report.stance && (
                <div className="flex flex-col items-center gap-2">
                  <Image
                    src={`/icons/stance-${report.stance}.png`}
                    alt={stanceLabels[report.stance] || report.stance}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <p
                    className={cn(
                      "text-lg font-bold",
                      report.stance === "for" && "text-primary-accent",
                      report.stance === "against" && "text-[#D23C3F]",
                      report.stance === "neutral" && "text-[#805F34]"
                    )}
                  >
                    {stanceLabels[report.stance] || report.stance}
                  </p>
                </div>
              )}
              {/* Role */}
              {report.role && (
                <p className="text-sm text-gray-600">{report.role}</p>
              )}
            </div>

            {/* Date, Duration, Character Count */}
            <div className="flex flex-col items-center gap-1 font-medium">
              <p className="text-sm text-gray-800">
                {formatDateTime(report.session_started_at)}
              </p>
              <p className="text-sm text-gray-800">
                {duration} / {characterCount} 文字
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-4 py-8">
        <div className="flex flex-col gap-9">
          {/* Interviewee Info */}
          {(report.role || report.role_description) && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-800">
                インタビューを受けた人
              </h2>
              <div className="bg-white rounded-2xl p-6">
                <div className="text-sm text-gray-800 whitespace-pre-wrap font-medium">
                  {report.role_description
                    ? report.role_description
                        .split("\n")
                        .map((line) => (
                          <p key={line}>
                            {line.startsWith("・") ? line : `・${line}`}
                          </p>
                        ))
                    : report.role && <p>・{report.role}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Chat Log Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              すべての会話ログ
            </h2>
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm text-gray-800">
            <Link href="/" className="hover:underline">
              TOP
            </Link>
            <ChevronRight className="w-5 h-5" />
            <Link
              href={getBillDetailLink(report.bill_id)}
              className="hover:underline"
            >
              法案詳細
            </Link>
            <ChevronRight className="w-5 h-5" />
            <span>会話ログ</span>
          </nav>
        </div>
      </div>
    </div>
  );
}

interface ChatMessageProps {
  message: {
    id: string;
    role: "assistant" | "user";
    content: string;
  };
}

function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={cn("flex gap-3", !isAssistant && "justify-end")}>
      {isAssistant && (
        <div className="flex-shrink-0">
          <Image
            src="/icons/ai-chat.svg"
            alt="AI"
            width={36}
            height={36}
            className="rounded-full"
          />
        </div>
      )}
      <div
        className={cn(
          "rounded-2xl px-4 py-3 max-w-[85%]",
          isAssistant
            ? "bg-white text-gray-800"
            : "bg-mirai-gradient text-gray-800"
        )}
      >
        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  );
}
