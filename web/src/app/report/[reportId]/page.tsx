import { ChevronRight, MessageSquareMore, Undo2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBillById } from "@/features/bills/server/loaders/get-bill-by-id";
import { PublicStatusSection } from "@/features/interview-report/client/components/public-status-section";
import { getInterviewReportById } from "@/features/interview-report/server/loaders/get-interview-report-by-id";
import { stanceLabels } from "@/features/interview-report/shared/constants";
import { getInterviewMessages } from "@/features/interview-session/server/loaders/get-interview-messages";

interface InterviewReportPageProps {
  params: Promise<{
    reportId: string;
  }>;
}

// 日時フォーマット
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}年${month}月${day}日  ${hours}:${minutes}`;
}

// インタビュー時間の計算
function calculateDuration(
  startedAt: string,
  completedAt: string | null
): string {
  if (!completedAt) return "-";
  const start = new Date(startedAt);
  const end = new Date(completedAt);
  const diffMs = end.getTime() - start.getTime();
  const diffMinutes = Math.round(diffMs / 1000 / 60);
  return `${diffMinutes} 分`;
}

// 文字数カウント（ユーザーのメッセージのみ）
function countCharacters(
  messages: Array<{ content: string; role: string }>
): number {
  return messages
    .filter((msg) => msg.role === "user")
    .reduce((acc, msg) => acc + msg.content.length, 0);
}

export default async function InterviewReportPage({
  params,
}: InterviewReportPageProps) {
  const { reportId } = await params;

  // レポートIDから全ての情報を取得
  const report = await getInterviewReportById(reportId);

  if (!report) {
    notFound();
  }

  const billId = report.bill_id;

  // 法案とメッセージを並列取得
  const [bill, messages] = await Promise.all([
    getBillById(billId),
    getInterviewMessages(report.interview_session_id),
  ]);

  if (!bill) {
    notFound();
  }

  const opinions =
    (report.opinions as Array<{ title: string; content: string }>) || [];
  const duration = calculateDuration(
    report.session_started_at,
    report.session_completed_at
  );
  const characterCount = countCharacters(messages);

  return (
    <div className="min-h-screen bg-[#F7F4F0]">
      {/* 法案サムネイル画像 */}
      {bill.thumbnail_url && (
        <div className="relative w-full h-[320px]">
          <Image
            src={bill.thumbnail_url}
            alt={bill.bill_content?.title || bill.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* ヘッダーセクション */}
      <div className="bg-white rounded-b-[32px] px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          {/* 完了イラスト */}
          <Image
            src="/illustrations/interview-complete.svg"
            alt="完了"
            width={236}
            height={152}
          />

          {/* 完了メッセージ */}
          <h1 className="text-2xl font-bold text-center text-gray-800 leading-relaxed">
            提出が完了しました！
            <br />
            ご協力ありがとうございました
          </h1>

          {/* 法案名 */}
          <div className="bg-[#F2F2F7] rounded-xl px-4 py-2">
            <p className="text-sm text-gray-800">
              {bill.bill_content?.title || bill.name}
            </p>
          </div>

          {/* 活用メッセージ */}
          <p className="text-sm text-gray-800">
            いただいた声は政策検討に最大限活用します
          </p>
        </div>
      </div>

      {/* インタビューレポートセクション */}
      <div className="px-4 py-8">
        <div className="flex flex-col gap-9">
          {/* セクションタイトルと公開ステータス */}
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-black">
              インタビューレポート
            </h2>
            <PublicStatusSection
              sessionId={report.interview_session_id}
              initialIsPublic={report.is_public_by_user}
            />
          </div>

          {/* レポートカード */}
          <div className="flex flex-col gap-9">
            {/* 要約カード */}
            <div className="flex flex-col items-center gap-9">
              <div className="relative px-7 py-8">
                {/* 背景の吹き出し風デザインはCSS疑似要素で実装 */}
                <p className="text-lg font-bold text-gray-800 leading-relaxed relative z-10">
                  {report.summary}
                </p>
              </div>

              {/* スタンスと日時情報 */}
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-3">
                  {/* スタンス */}
                  {report.stance && (
                    <p className="text-lg font-bold text-[#805F34]">
                      {stanceLabels[report.stance] || report.stance}
                    </p>
                  )}
                  {/* 役割 */}
                  {report.role && (
                    <p className="text-sm text-gray-600">{report.role}</p>
                  )}
                </div>

                {/* 日時・時間・文字数 */}
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm text-gray-800">
                    {formatDateTime(report.session_started_at)}
                  </p>
                  <p className="text-sm text-gray-800">
                    {duration} / {characterCount} 文字
                  </p>
                </div>
              </div>
            </div>

            {/* インタビューを受けた人 */}
            {(report.role || report.role_description) && (
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-gray-800">
                  👫インタビューを受けた人
                </h3>
                <div className="bg-white rounded-2xl p-6">
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">
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

            {/* 主な意見 */}
            {opinions.length > 0 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-gray-800">💬主な意見</h3>
                <div className="bg-white rounded-2xl p-6 flex flex-col gap-9">
                  {opinions.map((opinion, index) => (
                    <div
                      key={`opinion-${opinion.title}`}
                      className="flex flex-col gap-2.5"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="inline-flex">
                          <span className="bg-[#2AA693] text-white text-xs font-bold px-1.5 py-0.5 rounded">
                            意見{index + 1}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-gray-800">
                          {opinion.title}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-gray-500">背景</p>
                        <p className="text-sm text-gray-800">
                          {opinion.content}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* すべての会話ログを読むボタン */}
                  <Link
                    href={`/bills/${billId}/interview/chat`}
                    className="flex items-center justify-center gap-2.5 px-6 py-3 border border-gray-800 rounded-full"
                  >
                    <MessageSquareMore className="w-6 h-6 text-gray-800" />
                    <span className="text-base font-bold text-gray-800">
                      すべての会話ログを読む
                    </span>
                  </Link>
                </div>
              </div>
            )}

            {/* 法案の記事に戻るボタン */}
            <div className="flex flex-col gap-3">
              <Link
                href={`/bills/${billId}`}
                className="flex items-center justify-center gap-2.5 px-6 py-3 border border-gray-800 rounded-full bg-white"
              >
                <Undo2 className="w-5 h-5 text-gray-800" />
                <span className="text-base font-bold text-gray-800">
                  法案の記事に戻る
                </span>
              </Link>
            </div>

            {/* パンくずリスト */}
            <nav className="flex items-center gap-2 text-sm text-gray-800">
              <Link href="/" className="hover:underline">
                TOP
              </Link>
              <ChevronRight className="w-5 h-5" />
              <Link href={`/bills/${billId}`} className="hover:underline">
                法案詳細
              </Link>
              <ChevronRight className="w-5 h-5" />
              <span>AIインタビュー</span>
              <ChevronRight className="w-5 h-5" />
              <span>レポート</span>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
