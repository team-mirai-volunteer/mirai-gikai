"use client";

import { useState } from "react";
import type { PublicInterviewReport, StanceFilterType } from "../types";
import { FILTER_LABELS, stanceToFilterType } from "../types";
import { ReportCard } from "./report-card";

type Props = {
  reports: PublicInterviewReport[];
};

function getFilterCounts(reports: PublicInterviewReport[]) {
  const forCount = reports.filter(
    (r) => stanceToFilterType(r.stance) === "for"
  ).length;
  const againstCount = reports.filter(
    (r) => stanceToFilterType(r.stance) === "against"
  ).length;
  const otherCount = reports.length - forCount - againstCount;

  return {
    all: reports.length,
    for: forCount,
    against: againstCount,
    other: otherCount,
  };
}

function filterReports(
  reports: PublicInterviewReport[],
  filter: StanceFilterType
): PublicInterviewReport[] {
  if (filter === "all") return reports;
  return reports.filter((r) => stanceToFilterType(r.stance) === filter);
}

export function ReportsListWithFilter({ reports }: Props) {
  const [activeFilter, setActiveFilter] = useState<StanceFilterType>("all");
  const counts = getFilterCounts(reports);
  const filteredReports = filterReports(reports, activeFilter);

  const filters: { key: StanceFilterType; label: string; count: number }[] = [
    { key: "all", label: FILTER_LABELS.all, count: counts.all },
    { key: "for", label: FILTER_LABELS.for, count: counts.for },
    { key: "against", label: FILTER_LABELS.against, count: counts.against },
    { key: "other", label: FILTER_LABELS.other, count: counts.other },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* フィルターボタン */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setActiveFilter(filter.key)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${
                activeFilter === filter.key
                  ? "bg-mirai-gradient text-black"
                  : "bg-white text-[#c7c7cc] border border-[#e5e5e5]"
              }
            `}
          >
            {filter.label} {filter.count}
          </button>
        ))}
      </div>

      {/* レポートリスト */}
      {filteredReports.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">
          該当するご意見がありません
        </p>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
