"use client";

import { useMemo } from "react";
import type { InterviewReportData } from "../../shared/schemas";

type Props = {
  report: InterviewReportData;
};

export function InterviewReportView({ report }: Props) {
  const opinions = useMemo(() => {
    if (!report.opinions || !Array.isArray(report.opinions)) return [];
    return report.opinions as Array<{ title: string; content: string }>;
  }, [report.opinions]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold text-gray-500">
        インタビューレポート
      </p>
      <div className="mt-2 space-y-2 text-sm text-gray-800">
        {report.summary && (
          <div>
            <p className="font-semibold">要約</p>
            <p className="whitespace-pre-wrap text-gray-700">
              {report.summary}
            </p>
          </div>
        )}
        {report.stance && (
          <div className="flex gap-2 text-gray-700">
            <span className="font-semibold">スタンス</span>
            <span>{report.stance}</span>
          </div>
        )}
        {(report.role || report.role_description) && (
          <div className="space-y-1 text-gray-700">
            {report.role && (
              <p>
                <span className="font-semibold">役割: </span>
                <span>{report.role}</span>
              </p>
            )}
            {report.role_description && (
              <p className="whitespace-pre-wrap">
                <span className="font-semibold">説明: </span>
                <span>{report.role_description}</span>
              </p>
            )}
          </div>
        )}
        {opinions.length > 0 && (
          <div className="space-y-1 text-gray-700">
            <p className="font-semibold">意見</p>
            <ul className="list-disc pl-5 space-y-1">
              {opinions.map((op) => (
                <li
                  key={`${op.title}-${op.content}`}
                  className="whitespace-pre-wrap"
                >
                  <span className="font-semibold">{op.title}:</span>{" "}
                  {op.content}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
