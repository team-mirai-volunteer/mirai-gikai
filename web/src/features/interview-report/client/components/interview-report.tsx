"use client";

import { useMemo } from "react";
import type { InterviewReportData } from "@/features/interview-session/shared/schemas";
import { stanceLabels } from "../../shared/constants";

type Props = {
  report: InterviewReportData;
};

export function InterviewReportView({ report }: Props) {
  const opinions = useMemo(() => {
    if (!report.opinions || !Array.isArray(report.opinions)) return [];
    return report.opinions as Array<{ title: string; content: string }>;
  }, [report.opinions]);

  return (
    <div className="rounded-[16px] bg-mirai-light-gradient p-4 shadow-sm">
      {/* <p className="text-xs font-semibold">インタビューレポート</p> */}
      <div className="mt-2 space-y-3 text-sm">
        {report.summary && (
          <div className="font-bold space-y-1">
            <p className="text-primary-accent">💡意見の要約</p>
            <p className="whitespace-pre-wrap">{report.summary}</p>
          </div>
        )}
        {report.stance && (
          <div className="font-bold">
            <p className="text-primary-accent">🙋基本スタンス</p>
            <p>{stanceLabels[report.stance] || report.stance}</p>
          </div>
        )}
        {(report.role || report.role_description) && (
          <div className="space-y-2 font-bold">
            {report.role && (
              <div>
                <p className="text-primary-accent">立場</p>
                <p>{report.role}</p>
              </div>
            )}
            {report.role_description && (
              <div className="whitespace-pre-wrap">
                <p className="text-primary-accent">立場の詳細</p>
                <p>{report.role_description}</p>
              </div>
            )}
          </div>
        )}
        {opinions.length > 0 && (
          <div className="space-y-1">
            <p className="font-bold text-primary-accent">💬主な意見</p>
            <ul className="space-y-2">
              {opinions.map((op, index) => (
                <li
                  key={`${op.title}-${op.content}`}
                  className="whitespace-pre-wrap"
                >
                  <p className="font-bold">
                    {index + 1}. {op.title}
                  </p>
                  <p>{op.content}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
