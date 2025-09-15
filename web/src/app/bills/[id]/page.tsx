import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDifficultyLevel } from "@/features/bill-difficulty/api/get-difficulty-level";
import { getBillById } from "@/features/bills/api/get-bill-by-id";
import { BillDetailLayout } from "@/features/bills/components/bill-detail/bill-detail-layout";
import { ChatButton } from "@/features/chat/components/chat-button";

interface BillDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: BillDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const bill = await getBillById(id);

  if (!bill) {
    return {
      title: "議案が見つかりません",
    };
  }

  // bill_contentのsummaryがあればそれを使用、なければ従来のdescription等を使用
  const description =
    bill.bill_content?.summary || bill.description || "議案の詳細情報";

  return {
    title: bill.name,
    description: description,
    openGraph: {
      title: bill.name,
      description: description,
      type: "article",
      publishedTime: bill.published_at,
      modifiedTime: bill.updated_at,
    },
  };
}

export default async function BillDetailPage({ params }: BillDetailPageProps) {
  const { id } = await params;
  const [billWithContent, currentDifficulty] = await Promise.all([
    getBillById(id),
    getDifficultyLevel(),
  ]);

  if (!billWithContent) {
    notFound();
  }

  return (
    <>
      <BillDetailLayout
        bill={billWithContent}
        currentDifficulty={currentDifficulty}
      />
      <ChatButton billContext={billWithContent} />
    </>
  );
}
