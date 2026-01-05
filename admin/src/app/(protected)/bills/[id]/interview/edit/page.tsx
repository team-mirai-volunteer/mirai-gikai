import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getBillById } from "@/features/bills-edit/loaders/get-bill-by-id";
import { InterviewConfigForm } from "@/features/interview-config/components/interview-config-form";
import { InterviewQuestionList } from "@/features/interview-config/components/interview-question-list";
import { getInterviewConfig } from "@/features/interview-config/loaders/get-interview-config";
import { getInterviewQuestions } from "@/features/interview-config/loaders/get-interview-questions";

interface InterviewEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InterviewEditPage({
  params,
}: InterviewEditPageProps) {
  const { id } = await params;
  const [bill, config] = await Promise.all([
    getBillById(id),
    getInterviewConfig(id),
  ]);

  if (!bill) {
    notFound();
  }

  const questions = config ? await getInterviewQuestions(config.id) : [];

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/bills"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          議案一覧に戻る
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          インタビュー設定編集
        </h1>
        <p className="text-gray-600 mt-1">
          議案「{bill.name}」のインタビュー設定を編集します
        </p>
      </div>

      <div className="space-y-6">
        <InterviewConfigForm billId={bill.id} config={config} />
        {config && (
          <InterviewQuestionList
            interviewConfigId={config.id}
            questions={questions}
          />
        )}
        {!config && (
          <div className="rounded-lg border p-4 text-sm text-gray-500">
            インタビュー設定を保存すると、質問の追加が可能になります。
          </div>
        )}
      </div>
    </div>
  );
}
