import { MessageSquare, ThumbsUp, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Opinion, PublicInterviewReport, StanceTypeEnum } from "../types";
import { STANCE_LABELS, stanceToFilterType } from "../types";

interface ReportCardProps {
  report: PublicInterviewReport;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "今日";
  if (diffDays === 1) return "昨日";
  if (diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`;
  return `${Math.floor(diffDays / 365)}年前`;
}

function getStanceDisplay(stance: StanceTypeEnum | null): {
  label: string;
  dotColor: string;
  textColor: string;
} {
  const filterType = stanceToFilterType(stance);

  switch (filterType) {
    case "for":
      return {
        label: "期待している",
        dotColor: "bg-teal-500",
        textColor: "text-teal-700",
      };
    case "against":
      return {
        label: "懸念している",
        dotColor: "bg-rose-500",
        textColor: "text-rose-700",
      };
    default:
      return {
        label: stance ? STANCE_LABELS[stance] : "その他",
        dotColor: "bg-amber-500",
        textColor: "text-amber-700",
      };
  }
}

export function ReportCard({ report }: ReportCardProps) {
  const completedAt = report.interview_session.completed_at;
  const stanceDisplay = getStanceDisplay(report.stance);

  // opinions はJSONなのでパース
  const opinions = report.opinions as Opinion[] | null;

  return (
    <Card className="border border-black/10 hover:bg-muted/30 transition-colors overflow-hidden">
      <div className="p-4 flex flex-col gap-3">
        {/* ヘッダー: スタンス + 日時 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${stanceDisplay.dotColor}`}
            />
            <span className={`text-sm font-medium ${stanceDisplay.textColor}`}>
              {stanceDisplay.label}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {completedAt ? formatRelativeTime(completedAt) : "-"}
          </span>
        </div>

        {/* 役割 */}
        {report.role && (
          <div className="flex items-center gap-2">
            <User className="size-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium">{report.role}</span>
          </div>
        )}

        {/* 説明文 */}
        {report.summary && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {report.summary}
          </p>
        )}

        {/* 意見セクション（opinionsがあれば表示） */}
        {opinions && opinions.length > 0 && (
          <div className="flex items-start gap-2 pt-1">
            <MessageSquare className="size-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground line-clamp-2">
              {opinions[0].content}
            </p>
          </div>
        )}

        {/* 参考になるボタン（将来的に機能追加可能） */}
        <div className="flex items-center gap-1 text-muted-foreground pt-1">
          <ThumbsUp className="size-3.5" />
          <span className="text-xs">参考になる</span>
        </div>
      </div>
    </Card>
  );
}
