import { CheckCircle2, Clock, ExternalLink, XCircle } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InterviewSessionWithDetails } from "../types";
import { formatDuration, getSessionStatus } from "../types";

interface SessionListProps {
  billId: string;
  sessions: InterviewSessionWithDetails[];
  totalCount: number;
}

function StatusBadge({ status }: { status: "completed" | "in_progress" }) {
  if (status === "completed") {
    return (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200"
      >
        完了
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-yellow-50 text-yellow-700 border-yellow-200"
    >
      進行中
    </Badge>
  );
}

function BooleanIcon({ value }: { value: boolean }) {
  if (value) {
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  }
  return <XCircle className="h-5 w-5 text-red-400" />;
}

export function SessionList({
  billId,
  sessions,
  totalCount,
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-gray-500">
        まだセッションがありません
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">セッション一覧</h2>
        <div className="text-sm text-gray-600">
          全 {totalCount} 件中 1〜{Math.min(50, sessions.length)} 件を表示
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-16">No.</TableHead>
              <TableHead className="w-32">セッションID</TableHead>
              <TableHead className="w-24">ステータス</TableHead>
              <TableHead className="w-20 text-center">レポート</TableHead>
              <TableHead className="w-44">開始時刻</TableHead>
              <TableHead className="w-24">時間</TableHead>
              <TableHead className="w-24 text-right">メッセージ数</TableHead>
              <TableHead className="w-32">アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session, index) => {
              const status = getSessionStatus(session);
              const duration = formatDuration(
                session.started_at,
                session.completed_at
              );
              const hasReport = !!session.interview_report;

              return (
                <TableRow key={session.id}>
                  <TableCell className="font-medium text-blue-600">
                    #{totalCount - index}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-600">
                    {session.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={status} />
                  </TableCell>
                  <TableCell className="text-center">
                    <BooleanIcon value={hasReport} />
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(session.started_at).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{duration}</TableCell>
                  <TableCell className="text-right font-medium">
                    {session.message_count}
                  </TableCell>
                  <TableCell>
                    <Link href={`/bills/${billId}/reports/${session.id}`}>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-blue-600"
                      >
                        詳細を見る
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
