import { ArrowLeft, MessageSquareText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layouts/container";
import { Button } from "@/components/ui/button";
import { getBillById } from "@/features/bills/api/get-bill-by-id";
import {
  getPublicReports,
  getPublicReportsCount,
} from "@/features/interview-reports/api/get-public-reports";
import { ReportsList } from "@/features/interview-reports/components/reports-list";
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-12">
      <Container className="pt-6">
        {/* 戻るリンク */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href={`/bills/${id}`}>
              <ArrowLeft className="size-4 mr-1" />
              法案詳細に戻る
            </Link>
          </Button>
        </div>

        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <MessageSquareText className="size-5" />
            <span className="text-sm font-medium">みんなのご意見</span>
          </div>
          <h1 className="text-xl font-bold leading-tight mb-2">{billName}</h1>
          <p className="text-sm text-muted-foreground">
            この法案に対する市民の皆様のご意見を公開しています
            {totalCount > 0 && `（全${totalCount}件）`}
          </p>
        </div>

        {/* レポート一覧 */}
        <ReportsList
          billId={id}
          reports={reports}
          totalCount={totalCount}
          currentPage={currentPage}
        />
      </Container>
    </div>
  );
}
