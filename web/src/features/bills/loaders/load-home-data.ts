import { getBillsByFeaturedTags } from "@/features/bills/api/get-bills-by-featured-tags";
import { getPreviousDietSession } from "@/features/diet-sessions/api/get-previous-diet-session";
import type { DietSession } from "@/features/diet-sessions/types";
import { getComingSoonBills } from "../api/get-coming-soon-bills";
import { getFeaturedBills } from "../api/get-featured-bills";
import { getPreviousSessionBills } from "../api/get-previous-session-bills";
import type { BillWithContent } from "../types";

type PreviousSessionData = {
  session: DietSession;
  bills: BillWithContent[];
} | null;

/**
 * トップページ用のデータを並列取得する
 * BFF (Backend For Frontend) パターン
 */
export async function loadHomeData() {
  const [featuredBills, billsByTag, comingSoonBills, previousSession] =
    await Promise.all([
      getFeaturedBills(),
      getBillsByFeaturedTags(),
      getComingSoonBills(),
      getPreviousDietSession(),
    ]);

  // 前回のセッションがある場合のみ、その議案を取得
  let previousSessionData: PreviousSessionData = null;
  if (previousSession) {
    const previousBills = await getPreviousSessionBills(previousSession.id);
    previousSessionData = {
      session: previousSession,
      bills: previousBills,
    };
  }

  return {
    billsByTag,
    featuredBills,
    comingSoonBills,
    previousSessionData,
  };
}
