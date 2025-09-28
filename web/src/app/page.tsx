import { Container } from "@/components/layouts/container";
import { getBills } from "@/features/bills/api/get-bills";
import { BillList } from "@/features/bills/components/bill-list/bill-list";

export default async function Home() {
  const bills = await getBills();

  return (
    <Container>
      <div className="py-8">
        <main>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">議案一覧</h2>
            <p className="text-sm text-gray-600 mb-4">
              {bills.length}件の議案が公開されています
            </p>
          </div>

          <BillList bills={bills} />
        </main>
      </div>
    </Container>
  );
}
