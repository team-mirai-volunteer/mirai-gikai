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
const PREVIEW_BILLS = 5; // 5件目をうっすら見せる

export function PreviousSessionSection({
  session,
  bills,
}: PreviousSessionSectionProps) {
  const hasFade = bills.length > VISIBLE_BILLS;
  const previewBills = bills.slice(0, PREVIEW_BILLS);

  // slugがない場合はセクションを表示しない
  if (!session.slug || bills.length === 0) {
    return null;
  }

  const sessionBillsUrl = `/kokkai/${session.slug}/bills`;

  return (
    <section className="flex flex-col gap-6">
      {/* Archiveヘッダー */}
      <div className="flex flex-col gap-4">
        <h2>
          <Image
            src="/icons/archive-typography.svg"
            alt="Archive"
            width={156}
            height={36}
            priority
          />
        </h2>
        <p className="text-sm font-bold text-primary-accent">
          過去の国会に提出された法案
        </p>
      </div>

      {/* セクションヘッダー（リンク付き） */}
      <Link href={sessionBillsUrl} className="group">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[22px] font-bold text-[#1F2937] leading-[1.48] flex items-center gap-1">
              前回の国会に提出された法案✅
              <ChevronRight className="h-5 w-5 text-gray-600 group-hover:translate-x-0.5 transition-transform" />
            </h3>
            <p className="text-xs font-medium text-[#404040] leading-[1.67]">
              {session.name}
            </p>
          </div>
        </div>
      </Link>

      {/* 議案カードリスト */}
      <div className="relative flex flex-col gap-3 overflow-hidden pb-16">
        {previewBills.map((bill, index) => (
          <Link key={bill.id} href={`/bills/${bill.id}`}>
            <PreviousSessionBillCard
              bill={bill}
              // 5件目は少し淡く表示して「続きを見る」感を出す
              className={
                !hasFade || index < VISIBLE_BILLS ? undefined : "opacity-70"
              }
            />
          </Link>
        ))}

        {/* もっと読むリンク（グラデーションオーバーレイ付き） */}
        {hasFade && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0">
            <div className="h-32 bg-gradient-to-t from-white to-white/30" />
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

function PreviousSessionBillCard({
  bill,
  className,
}: {
  bill: BillWithContent;
  className?: string;
}) {
  const displayTitle = bill.bill_content?.title || bill.name;

  return (
    <Card
      className={`border border-black hover:bg-muted/50 transition-colors overflow-hidden ${className ?? ""}`}
    >
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
