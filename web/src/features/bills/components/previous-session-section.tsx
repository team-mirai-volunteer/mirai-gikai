import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DietSession } from "@/features/diet-sessions/types";
import { formatDateWithDots } from "@/lib/utils/date";
import type { BillWithContent } from "../types";
import { BillStatusBadge } from "./bill-list/bill-status-badge";

interface PreviousSessionSectionProps {
  session: DietSession;
  bills: BillWithContent[];
}

const VISIBLE_BILLS = 4;

export function PreviousSessionSection({
  session,
  bills,
}: PreviousSessionSectionProps) {
  const hasMoreBills = bills.length > VISIBLE_BILLS;
  const visibleBills = bills.slice(0, VISIBLE_BILLS);

  if (bills.length === 0) {
    return null;
  }

  // 会期のURLを生成（slugがあればそれを使用）
  const sessionBillsUrl = session.slug
    ? `/kokkai/${session.slug}/bills`
    : `/kokkai/${session.id}/bills`;

  return (
    <section className="flex flex-col gap-6">
      {/* セクションヘッダー */}
      <Link href={sessionBillsUrl} className="group">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[22px] font-bold text-[#1F2937] leading-[1.48] flex items-center gap-1">
              前回の国会に提出された法案✅
              <ChevronRight className="h-5 w-5 text-gray-600 group-hover:translate-x-0.5 transition-transform" />
            </h2>
            <p className="text-xs font-medium text-[#404040] leading-[1.67]">
              {session.name}
            </p>
          </div>
        </div>
      </Link>

      {/* 議案カードリスト */}
      <div className="flex flex-col gap-3 relative">
        {visibleBills.map((bill) => (
          <Link key={bill.id} href={`/bills/${bill.id}`}>
            <PreviousSessionBillCard bill={bill} />
          </Link>
        ))}

        {/* もっと読むリンク（グラデーションオーバーレイ付き） */}
        {hasMoreBills && (
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
            <div className="h-32 bg-gradient-to-t from-white via-white/95 to-transparent" />
            <div className="bg-white pt-2 pb-4 flex justify-center pointer-events-auto">
              <Button
                variant="outline"
                size="lg"
                asChild
                className="px-12 py-3 text-base font-medium border-black rounded-full hover:bg-gray-50"
              >
                <Link href={sessionBillsUrl}>もっと読む</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PreviousSessionBillCard({ bill }: { bill: BillWithContent }) {
  const displayTitle = bill.bill_content?.title || bill.name;

  return (
    <Card className="border border-black hover:bg-muted/50 transition-colors overflow-hidden">
      <div className="flex">
        {/* コンテンツエリア */}
        <div className="flex-1 p-4 flex flex-col gap-2">
          <h3 className="font-bold text-base leading-tight line-clamp-2">
            {displayTitle}
          </h3>
          <div className="flex items-center gap-2">
            <BillStatusBadge status={bill.status} className="w-fit" />
            <span className="text-xs text-muted-foreground">
              {bill.published_at
                ? `${formatDateWithDots(bill.published_at)} 提出`
                : "法案提出前"}
            </span>
          </div>
        </div>

        {/* サムネイル画像 */}
        {bill.thumbnail_url && (
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={bill.thumbnail_url}
              alt={bill.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
