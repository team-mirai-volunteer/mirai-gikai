import { notFound } from "next/navigation";
import { getBillById } from "@/features/bills/api/get-bill-by-id";
import { getChatSupabaseUser } from "@/features/chat/lib/supabase-server";
import { getInterviewConfig } from "@/features/interview-config/api/get-interview-config";
import { createInterviewSession } from "@/features/interview-session/actions/create-interview-session";
import { getInterviewMessages } from "@/features/interview-session/api/get-interview-messages";
import { getInterviewSession } from "@/features/interview-session/api/get-interview-session";
import { InterviewChatClient } from "@/features/interview-session/components/interview-chat-client";

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

  // 匿名ユーザーを取得
  const {
    data: { user },
    error: getUserError,
  } = await getChatSupabaseUser();

  if (getUserError || !user) {
    notFound();
  }

  // セッション取得または作成
  let session = await getInterviewSession(interviewConfig.id);
  if (!session) {
    session = await createInterviewSession({
      interviewConfigId: interviewConfig.id,
    });
  }

  // メッセージ履歴を取得
  const messages = await getInterviewMessages(session.id);

  return (
    <InterviewChatClient
      billId={billId}
      interviewConfigId={interviewConfig.id}
      sessionId={session.id}
      initialMessages={messages}
    />
  );
}
