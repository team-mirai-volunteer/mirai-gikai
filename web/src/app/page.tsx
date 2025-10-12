import { Container } from "@/components/layouts/container";
import { About } from "@/components/top/about";
import { Hero } from "@/components/top/hero";
import { getBills } from "@/features/bills/api/get-bills";
import { BillList } from "@/features/bills/components/bill-list/bill-list";
import { CurrentDietSession } from "@/features/diet-sessions/components/current-diet-session";

export default async function Home() {
  const bills = await getBills();

  return (
    <>
      <Hero />

      {/* 本日の国会セクション */}
      <CurrentDietSession />

      {/* 議案一覧セクション */}
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

      {/* みらい議会とは セクション */}
      <About />
    </>
  );
}
