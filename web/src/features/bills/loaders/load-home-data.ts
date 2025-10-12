import { getBills } from "@/features/bills/api/get-bills";
import { getFeaturedBills } from "@/features/bills/api/get-featured-bill";

/**
 * トップページ用のデータを並列取得する
 * BFF (Backend For Frontend) パターン
 */
export async function loadHomeData() {
  const [bills, featuredBills] = await Promise.all([
    getBills(),
    getFeaturedBills(),
  ]);

  return {
    bills,
    featuredBills,
  };
}
