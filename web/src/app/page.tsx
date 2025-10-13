import { Container } from "@/components/layouts/container";
import { About } from "@/components/top/about";
import { Hero } from "@/components/top/hero";
import { TeamMirai } from "@/components/top/team-mirai";
import { getDifficultyLevel } from "@/features/bill-difficulty/api/get-difficulty-level";
import { BillsByTagSection } from "@/features/bills/components/bills-by-tag-section";
import { FeaturedBillSection } from "@/features/bills/components/featured-bill-section";
import { loadHomeData } from "@/features/bills/loaders/load-home-data";
import type { BillWithContent } from "@/features/bills/types";
import { HomeChatClient } from "@/features/chat/components/home-chat-client";
import { getCurrentDietSession } from "@/features/diet-sessions/api/get-current-diet-session";
import { CurrentDietSession } from "@/features/diet-sessions/components/current-diet-session";
import { getJapanTime } from "@/lib/utils/date";

export default async function Home() {
  const { billsByTag, featuredBills } = await loadHomeData();

  // ゆくゆくタグ機能がマージされたらBFFに統合する
  const [currentSession, currentDifficulty] = await Promise.all([
    getCurrentDietSession(getJapanTime()),
    getDifficultyLevel(),
  ]);

  const toBillChatContext = (bill: BillWithContent) => {
    return {
      name: bill.name,
      summary: bill.bill_content?.summary,
      tags: bill.tags?.map((tag) => tag.label) || [],
      isFeatured: featuredBills.some((b) => b.id === bill.id),
    };
  };

  return (
    <>
      <Hero />

      {/* 本日の国会セクション */}
      <CurrentDietSession session={currentSession} />

      {/* 議案一覧セクション */}
      <Container>
        <div className="py-8">
          <main className="flex flex-col gap-16">
            {/* 注目の法案セクション */}
            <FeaturedBillSection bills={featuredBills} />

            {/* タグ別議案一覧セクション */}
            <BillsByTagSection billsByTag={billsByTag} />
          </main>
        </div>
      </Container>

      {/* みらい議会とは セクション */}
      <About />

      {/* チームみらいについて セクション */}
      <TeamMirai />

      {/* チャット機能 */}
      <HomeChatClient
        currentDifficulty={currentDifficulty}
        bills={billsByTag
          .flatMap((x) => x.bills)
          .concat(featuredBills)
          .map(toBillChatContext)}
      />
    </>
  );
}
