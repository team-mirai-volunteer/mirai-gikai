import { MessageSquareText } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/layouts/container";
import { getBillById } from "@/features/bills/api/get-bill-by-id";
import {
  getPublicReports,
  getPublicReportsCount,
} from "@/features/interview-reports/api/get-public-reports";
import { ReportsListWithFilter } from "@/features/interview-reports/components/reports-list-with-filter";
import { env } from "@/lib/env";

interface ReportsPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata({
  params,
}: ReportsPageProps): Promise<Metadata> {
  const { id } = await params;
  const bill = await getBillById(id);

  if (!bill) {
    return {
      title: "議案が見つかりません",
    };
  }

  const billName = bill.bill_content?.title ?? bill.name;
  const description = `${billName} に関する市民の皆様のご意見一覧`;
  const defaultOgpUrl = new URL("/ogp.jpg", env.webUrl).toString();
  const shareImageUrl =
    bill.share_thumbnail_url || bill.thumbnail_url || defaultOgpUrl;

  return {
    title: `みんなのご意見 - ${billName}`,
    description: description,
    alternates: {
      canonical: `/bills/${bill.id}/reports`,
    },
    openGraph: {
      title: `みんなのご意見 - ${billName}`,
      description: description,
      type: "website",
      images: [
        {
          url: shareImageUrl,
          alt: `${billName} のご意見一覧ページ`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `みんなのご意見 - ${billName}`,
      description: description,
      images: [shareImageUrl],
    },
  };
}

export default async function ReportsPage({
  params,
  searchParams,
}: ReportsPageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const [bill, reports, totalCount] = await Promise.all([
    getBillById(id),
    getPublicReports(id, currentPage),
    getPublicReportsCount(id),
  ]);

  if (!bill) {
    notFound();
  }

  const billName = bill.bill_content?.title ?? bill.name;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* ヒーロー画像 */}
      {bill.thumbnail_url ? (
        <div className="relative w-full h-48 md:h-64">
          <Image
            src={bill.thumbnail_url}
            alt={bill.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      ) : (
        <div className="w-full h-20 bg-gradient-to-b from-slate-200 to-slate-100" />
      )}

      {/* コンテンツ */}
      <Container className="py-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{billName}</h1>
        </div>

        {/* セクションタイトル */}
        <div className="flex items-center gap-2 mb-6">
          <MessageSquareText className="size-5 text-teal-600" />
          <h2 className="text-lg font-bold">
            法案に対する当事者の意見{" "}
            <span className="text-teal-600">{totalCount}件</span>
          </h2>
        </div>

        {/* フィルター付きレポート一覧 */}
        <ReportsListWithFilter reports={reports} />
      </Container>
    </div>
  );
}
