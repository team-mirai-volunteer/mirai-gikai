import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

  return {
    title: bill.name,
    description: bill.headline || bill.description || "議案の詳細情報",
    openGraph: {
      title: bill.name,
      description: bill.headline || bill.description || "議案の詳細情報",
      type: "article",
      publishedTime: bill.published_at,
      modifiedTime: bill.updated_at,
    },
  };
}

export default async function BillDetailPage({ params }: BillDetailPageProps) {
  const { id } = await params;
  const billWithStance = await getBillById(id);

  if (!billWithStance) {
    notFound();
  }

  return <BillDetailLayout bill={billWithStance} />;
}
