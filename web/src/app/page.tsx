import { Container } from "@/components/layouts/container";
import { About } from "@/components/top/about";
import { Hero } from "@/components/top/hero";
import { BillListSection } from "@/features/bills/components/bill-list-section";
import { FeaturedBillSection } from "@/features/bills/components/featured-bill-section";
import { loadHomeData } from "@/features/bills/loaders/load-home-data";

export default async function Home() {
  const { bills, featuredBills } = await loadHomeData();

  return (
    <>
      <Hero />

      <Container>
        <div className="py-8">
          <main className="flex flex-col gap-16">
            {/* 注目の法案セクション */}
            <FeaturedBillSection bills={featuredBills} />

            {/* 議案一覧セクション */}
            <BillListSection bills={bills} />
          </main>
        </div>
      </Container>

      {/* みらい議会とは セクション */}
      <About />
    </>
  );
}
