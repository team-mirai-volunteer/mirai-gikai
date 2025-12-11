import { getBillsByFeaturedTags } from "@/features/bills/api/get-bills-by-featured-tags";
import { getComingSoonBills } from "../api/get-coming-soon-bills";
import { getFeaturedBills } from "../api/get-featured-bills";

/**
 * トップページ用のデータを並列取得する
 * BFF (Backend For Frontend) パターン
 */
export async function loadHomeData() {
  const [featuredBills, billsByTag, comingSoonBills] = await Promise.all([
    getFeaturedBills(),
    getBillsByFeaturedTags(),
    getComingSoonBills(),
  ]);

  return {
    billsByTag,
    featuredBills,
    comingSoonBills,
  };
}
