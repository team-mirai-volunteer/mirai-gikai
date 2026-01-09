import {
  Briefcase,
  ChevronRight,
  GraduationCap,
  Home,
  Undo2,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBillDetailLink } from "@/features/interview-config/shared/utils/interview-links";
import { getReportWithMessages } from "../loaders/get-report-with-messages";
import {
  type InterviewReportRole,
  roleLabels,
  stanceLabels,
} from "../../shared/constants";

import {
  countCharacters,
  formatDateTime,
} from "../../shared/utils/report-utils";

const roleIcons: Record<InterviewReportRole, LucideIcon> = {
  subject_expert: GraduationCap,
  work_related: Briefcase,
  daily_life_affected: Home,
  general_citizen: User,
};

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
  const characterCount = countCharacters(messages);
  const opinions =
    (report.opinions as Array<{ title: string; content: string }>) || [];

  return (
    <div className="min-h-screen bg-[#F7F4F0]">
      {/* Header Section */}
      <div className="px-4 pt-24 pb-8">
        <div className="flex flex-col items-center">
          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-800">
            インタビューレポート
          </h1>

          {/* Bill Name */}
          <Link
            href={getBillDetailLink(report.bill_id)}
            className="text-sm text-black underline mt-2"
          >
            {billName}
          </Link>

          {/* Stance and Meta Info */}
          <div className="flex flex-col items-center gap-6 mt-8">
            <div className="flex flex-col items-center gap-1">
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
              {report.role &&
                (() => {
                  const RoleIcon =
                    roleIcons[report.role as InterviewReportRole];
                  return (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      {RoleIcon && <RoleIcon size={16} strokeWidth={1.5} />}
                      {roleLabels[report.role as keyof typeof roleLabels] ||
                        report.role}
                    </p>
                  );
                })()}
            </div>

            {/* Date, Duration, Character Count */}
            <div className="text-sm text-black text-center">
              <p className="font-medium">
                {formatDateTime(report.session_started_at)}
              </p>
              <p className="font-normal">
                インタビューの分量{" "}
                <span className="underline">{characterCount}文字</span>
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
                👫インタビューを受けた人
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
              🎤すべての会話ログ
            </h2>
            <div className="bg-white rounded-2xl p-6">
              <div className="flex flex-col gap-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>
            </div>
          </div>

          {/* Opinions Section */}
          {opinions.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-800">💬意見の要約</h2>
              <div className="bg-white rounded-2xl p-6 flex flex-col gap-6">
                {opinions.map((opinion, index) => (
                  <div key={opinion.title} className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <div className="inline-flex">
                        <span className="bg-[#2AA693] text-white text-xs font-bold px-1.5 py-0.5 rounded">
                          意見{index + 1}
                        </span>
                      </div>
                      <p className="text-base font-bold text-gray-800">
                        {opinion.title}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">{opinion.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back to Bill Button */}
          <div className="flex flex-col gap-3">
            <Link
              href={getBillDetailLink(report.bill_id)}
              className="flex items-center justify-center gap-2.5 px-6 py-3 border border-gray-800 rounded-full bg-white"
            >
              <Undo2 className="w-5 h-5 text-gray-800" />
              <span className="text-base font-bold text-gray-800">
                法案の記事に戻る
              </span>
            </Link>
          </div>

          {/* Breadcrumb Navigation */}
          <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-800">
            <Link href="/" className="hover:underline">
              TOP
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href={getBillDetailLink(report.bill_id)}
              className="hover:underline"
            >
              法案詳細
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>AIインタビュー</span>
            <ChevronRight className="w-4 h-4" />
            <span>レポート</span>
            <ChevronRight className="w-4 h-4" />
            <span>すべての会話ログ</span>
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

  if (isAssistant) {
    // AI message: icon + plain text (no bubble)
    return (
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Image
            src="/icons/ai-chat.svg"
            alt="AI"
            width={36}
            height={36}
            className="rounded-full"
          />
        </div>
        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-gray-800 pt-2">
          {message.content}
        </p>
      </div>
    );
  }

  // User message: light gradient bubble on the right
  return (
    <div className="flex justify-end">
      <div className="bg-mirai-light-gradient rounded-2xl px-4 py-3 max-w-[85%]">
        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-gray-800">
          {message.content}
        </p>
      </div>
    </div>
  );
}
