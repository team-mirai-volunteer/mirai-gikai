import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { PublicInterviewReport } from "../../shared/types";

export const REPORTS_PER_PAGE = 20;

export async function getPublicReports(
  billId: string,
  page = 1
): Promise<PublicInterviewReport[]> {
  return _getCachedPublicReports(billId, page);
}

const _getCachedPublicReports = unstable_cache(
  async (billId: string, page: number): Promise<PublicInterviewReport[]> => {
    const supabase = createAdminClient();

    // まずinterview_configを取得
    const { data: config, error: configError } = await supabase
      .from("interview_configs")
      .select("id")
      .eq("bill_id", billId)
      .single();

    if (configError || !config) {
      return [];
    }

    // ページネーション計算
    const from = (page - 1) * REPORTS_PER_PAGE;
    const to = from + REPORTS_PER_PAGE - 1;

    // 公開されているレポートのみ取得
    const { data: sessions, error: sessionsError } = await supabase
      .from("interview_sessions")
      .select(
        `
        id,
        started_at,
        completed_at,
        interview_report!inner(*)
      `
      )
      .eq("interview_config_id", config.id)
      .eq("interview_report.is_public", true)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .range(from, to);

    if (sessionsError || !sessions) {
      console.error("Failed to fetch public reports:", sessionsError);
      return [];
    }

    // レポート形式に変換
    const reports: PublicInterviewReport[] = sessions
      .filter((session) => session.interview_report)
      .map((session) => {
        const report = Array.isArray(session.interview_report)
          ? session.interview_report[0]
          : session.interview_report;

        return {
          ...report,
          interview_session: {
            id: session.id,
            started_at: session.started_at,
            completed_at: session.completed_at,
          },
        };
      });

    return reports;
  },
  ["public-reports"],
  {
    revalidate: 60, // 1分
    tags: [CACHE_TAGS.BILLS],
  }
);

export async function getPublicReportsCount(billId: string): Promise<number> {
  return _getCachedPublicReportsCount(billId);
}

const _getCachedPublicReportsCount = unstable_cache(
  async (billId: string): Promise<number> => {
    const supabase = createAdminClient();

    // まずinterview_configを取得
    const { data: config, error: configError } = await supabase
      .from("interview_configs")
      .select("id")
      .eq("bill_id", billId)
      .single();

    if (configError || !config) {
      return 0;
    }

    // 公開レポート付きの完了セッション数をカウント
    const { count, error } = await supabase
      .from("interview_sessions")
      .select(
        `
        id,
        interview_report!inner(id)
      `,
        { count: "exact", head: true }
      )
      .eq("interview_config_id", config.id)
      .eq("interview_report.is_public", true)
      .not("completed_at", "is", null);

    if (error) {
      console.error("Failed to fetch public reports count:", error);
      return 0;
    }

    return count || 0;
  },
  ["public-reports-count"],
  {
    revalidate: 60, // 1分
    tags: [CACHE_TAGS.BILLS],
  }
);
