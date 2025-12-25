import { MessageSquare, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PublicInterviewReport } from "../types";
import { StanceBadge } from "./stance-badge";

interface ReportCardProps {
  report: PublicInterviewReport;
  index: number;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ReportCard({ report, index }: ReportCardProps) {
  const completedAt = report.interview_session.completed_at;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">#{index + 1}</span>
            <span>·</span>
            <span>{completedAt ? formatDate(completedAt) : "-"}</span>
          </div>
          {report.stance && <StanceBadge stance={report.stance} />}
        </div>
        {report.role && (
          <CardTitle className="flex items-center gap-2 text-base mt-2">
            <User className="size-4 text-muted-foreground flex-shrink-0" />
            <span>{report.role}</span>
          </CardTitle>
        )}
        {report.role_description && (
          <CardDescription className="mt-1 line-clamp-2">
            {report.role_description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {report.summary && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <MessageSquare className="size-4" />
              <span>ご意見</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90 line-clamp-4">
              {report.summary}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
