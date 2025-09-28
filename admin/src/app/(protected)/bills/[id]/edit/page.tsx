import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getBillById } from "@/features/bills-edit/api/get-bill-by-id";
import { BillEditForm } from "@/features/bills-edit/components/bill-edit-form";
import { getStanceByBillId } from "@/features/mirai-stance/api/get-stance-by-bill-id";
import { StanceForm } from "@/features/mirai-stance/components/stance-form";

interface BillEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BillEditPage({ params }: BillEditPageProps) {
  const { id } = await params;
  const [bill, stance] = await Promise.all([
    getBillById(id),
    getStanceByBillId(id),
  ]);

  if (!bill) {
    notFound();
  }

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
        <h1 className="text-2xl font-bold text-gray-900">議案編集</h1>
        <p className="text-gray-600 mt-1">議案の基本情報を編集します</p>
      </div>

      <div className="space-y-6">
        <BillEditForm bill={bill} />
        <StanceForm billId={bill.id} stance={stance} billStatus={bill.status} />
      </div>
    </div>
  );
}
