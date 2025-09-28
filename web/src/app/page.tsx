import { Container } from "@/components/layouts/container";
import { getBills } from "@/features/bills/api/get-bills";
import { BillList } from "@/features/bills/components/bill-list/bill-list";

function Hero() {
  return (
    <div
      className="-mt-20 relative w-full h-[80vh] min-h-[400px] md:h-[70vh] lg:h-[80vh] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/img/hero_background.png')" }}
    >
      <div className="absolute bottom-[30vh] left-0 right-0 py-4">
        <Container>
          <p className="font-bold text-xl md:text-2xl leading-relaxed">
            いま国会で議論されていること <br />
            やさしい言葉で説明します
          </p>
          <p className="mt-2 font-lexend text-xs">powered by Team Mirai & AI</p>
        </Container>
      </div>

      {/* スクロールインジケーター */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce-gentle">
        <div className="w-[1px] h-[34px] bg-black"></div>
        <p className="mt-2 font-lexend text-[10px] leading-[20px] text-black">
          Scroll
        </p>
      </div>
    </div>
  );
}

export default async function Home() {
  const bills = await getBills();

  return (
    <>
      <Hero />
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
    </>
  );
}
