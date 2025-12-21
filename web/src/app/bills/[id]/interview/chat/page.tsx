import { notFound } from "next/navigation";
import { getBillById } from "@/features/bills/api/get-bill-by-id";
import { getInterviewConfig } from "@/features/interview-config/api/get-interview-config";
import { InterviewChatClient } from "@/features/interview-session/components/interview-chat-client";
import { initializeInterviewChat } from "@/features/interview-session/loaders/initialize-interview-chat";

interface InterviewChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InterviewChatPage({
  params,
}: InterviewChatPageProps) {
  const { id: billId } = await params;

  // 法案とインタビュー設定を取得
  const [bill, interviewConfig] = await Promise.all([
    getBillById(billId),
    getInterviewConfig(billId),
  ]);

  if (!bill || !interviewConfig) {
    notFound();
  }

  // インタビューチャットの初期化処理
  const { session, messages } = await initializeInterviewChat(
    billId,
    interviewConfig.id
  );

  return (
    <InterviewChatClient
      billId={billId}
      interviewConfigId={interviewConfig.id}
      sessionId={session.id}
      initialMessages={messages}
    />
  );
}
