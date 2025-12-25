import Link from "next/link";
import { Button } from "@/components/ui/button";
import { REPORTS_PER_PAGE } from "../api/get-public-reports";
import type { PublicInterviewReport } from "../types";
import { ReportCard } from "./report-card";

interface ReportsListProps {
  billId: string;
  reports: PublicInterviewReport[];
  totalCount: number;
  currentPage: number;
}

export function ReportsList({
  billId,
  reports,
  totalCount,
  currentPage,
}: ReportsListProps) {
  const totalPages = Math.ceil(totalCount / REPORTS_PER_PAGE);
  const startIndex = (currentPage - 1) * REPORTS_PER_PAGE;

  if (reports.length === 0 && currentPage === 1) {
    return (
      <div className="rounded-xl border bg-muted/30 p-8 text-center">
        <p className="text-muted-foreground">
          まだ公開されているご意見はありません
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* レポート一覧 */}
      <div className="grid gap-4">
        {reports.map((report, index) => (
          <ReportCard
            key={report.id}
            report={report}
            index={startIndex + index}
          />
        ))}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            asChild={currentPage > 1}
          >
            {currentPage > 1 ? (
              <Link
                href={`/bills/${billId}/reports?page=${currentPage - 1}`}
                prefetch={false}
              >
                前へ
              </Link>
            ) : (
              <span>前へ</span>
            )}
          </Button>

          <span className="px-4 text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            asChild={currentPage < totalPages}
          >
            {currentPage < totalPages ? (
              <Link
                href={`/bills/${billId}/reports?page=${currentPage + 1}`}
                prefetch={false}
              >
                次へ
              </Link>
            ) : (
              <span>次へ</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
