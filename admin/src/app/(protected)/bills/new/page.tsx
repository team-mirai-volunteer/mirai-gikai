import { BillCreateForm } from "@/features/bills-edit/components/bill-create-form";

export default function BillCreatePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">議案新規作成</h1>
      <BillCreateForm />
    </div>
  );
}
