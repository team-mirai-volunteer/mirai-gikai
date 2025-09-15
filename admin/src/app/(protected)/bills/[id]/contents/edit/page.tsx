import { getBillById } from "@/features/bills-edit/api/get-bill-by-id";
import { getBillContents } from "@/features/bills-edit/api/get-bill-contents";
import { BillContentsEditForm } from "@/features/bills-edit/components/bill-contents-edit-form";

interface BillContentsEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function BillContentsEditPage({
  params,
}: BillContentsEditPageProps) {
  const { id } = await params;

  // 議案とコンテンツを並行取得
  const [billResult, billContents] = await Promise.all([
    getBillById(id),
    getBillContents(id),
  ]);

  if (!billResult) {
    throw new Error("議案が見つかりません");
  }

  const bill = billResult;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        議案コンテンツ編集
      </h1>
      <BillContentsEditForm bill={bill} billContents={billContents} />
    </div>
  );
}
