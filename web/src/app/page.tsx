import { Container } from "@/components/layouts/container";
import { getDifficultyLevel } from "@/features/bills/actions/difficulty";
import { getBills } from "@/features/bills/api/get-bills";
import { BillList } from "@/features/bills/components";
import { DifficultySelector } from "@/features/bills/components/difficulty-selector";

export default async function Home() {
  const [bills, currentDifficulty] = await Promise.all([
    getBills(),
    getDifficultyLevel(),
  ]);

  return (
    <Container>
      <div className="py-8">
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                みらい議会
              </h1>
              <p className="text-gray-600">
                国会で審議される議案をわかりやすくお伝えします
              </p>
            </div>
            <DifficultySelector currentLevel={currentDifficulty} />
          </div>
        </header>

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
