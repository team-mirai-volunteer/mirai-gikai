import { ArrowRight, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LatestInterviewSession } from "@/features/interview-session/server/api/get-latest-interview-session";
import { RestartInterviewButton } from "@/features/interview-session/client/components/restart-interview-button";

interface InterviewActionButtonsProps {
  billId: string;
  sessionInfo: LatestInterviewSession | null;
}

export function InterviewActionButtons({
  billId,
  sessionInfo,
}: InterviewActionButtonsProps) {
  const isActive = sessionInfo?.status === "active";
  const isCompleted = sessionInfo?.status === "completed";

  // 完了済みでレポートがある場合
  if (isCompleted && sessionInfo?.reportId) {
    return (
      <>
        <Link href={`/report/${sessionInfo.reportId}`}>
          <Button className="w-full bg-mirai-gradient text-black border border-black rounded-[100px] h-[48px] px-6 font-bold text-[15px] hover:opacity-90 transition-opacity flex items-center justify-center gap-4">
            <FileText className="size-5" />
            <span>インタビューレポートを確認する</span>
            <ArrowRight className="size-5" />
          </Button>
        </Link>
        <RestartInterviewButton sessionId={sessionInfo.id} billId={billId} />
      </>
    );
  }

  // 進行中または新規の場合
  return (
    <>
      <Link href={`/bills/${billId}/interview/chat`}>
        <Button className="w-full bg-mirai-gradient text-black border border-black rounded-[100px] h-[48px] px-6 font-bold text-[15px] hover:opacity-90 transition-opacity flex items-center justify-center gap-4">
          <Image
            src="/icons/messages-square-icon.svg"
            alt=""
            width={24}
            height={24}
            className="object-contain"
          />
          <span>
            {isActive ? "AIインタビューを再開する" : "AIインタビューをはじめる"}
          </span>
          <ArrowRight className="size-5" />
        </Button>
      </Link>
      {isActive && sessionInfo && (
        <RestartInterviewButton sessionId={sessionInfo.id} billId={billId} />
      )}
    </>
  );
}
