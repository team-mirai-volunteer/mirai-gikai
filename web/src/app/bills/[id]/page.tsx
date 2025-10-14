import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDifficultyLevel } from "@/features/bill-difficulty/api/get-difficulty-level";
import { getBillById } from "@/features/bills/api/get-bill-by-id";
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
  const imageUrl = bill.thumbnail_url || "/og-image.png";

  return {
    title: bill.name,
    description: description,
    keywords: ["議案", "法案", bill.name, "国会", "政治"],
    openGraph: {
      title: bill.name,
      description: description,
      type: "article",
      publishedTime: bill.published_at,
      modifiedTime: bill.updated_at,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: bill.name,
        },
      ],
      locale: "ja_JP",
      siteName: "みらい議会",
    },
    twitter: {
      card: "summary_large_image",
      title: bill.name,
      description: description,
      images: [imageUrl],
      creator: "@team_mirai",
    },
    alternates: {
      canonical: `/bills/${id}`,
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
