import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDifficultyLevel } from "@/features/bill-difficulty/api/get-difficulty-level";
import { getBillById } from "@/features/bills/api/get-bill-by-id";
import { env } from "@/lib/env";
import { BillDetailLayout } from "@/features/bills/components/bill-detail/bill-detail-layout";

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

  // bill_contentのsummaryがあればそれを使用、なければデフォルト値を使用
  const description = bill.bill_content?.summary || "議案の詳細情報";

  return {
    title: bill.name,
    description: description,
    openGraph: {
      title: bill.name,
      description: description,
      type: "article",
      publishedTime: bill.published_at ?? undefined,
      modifiedTime: bill.updated_at,
      ...(bill.thumbnail_url
        ? {
            images: [
              {
                url: bill.thumbnail_url,
                alt: `${bill.name} のサムネイル`,
              },
            ],
          }
        : {
            images: [
              {
                url: new URL("/ogp.png", env.webUrl).toString(),
                width: 1200,
                height: 630,
                alt: "みらい議会のOGPイメージ",
              },
            ],
          }),
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
    <BillDetailLayout
      bill={billWithContent}
      currentDifficulty={currentDifficulty}
    />
  );
}
