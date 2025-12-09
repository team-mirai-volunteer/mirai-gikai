import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ComingSoonBill } from "@/features/bills/types";
import { HOUSE_LABELS } from "@/features/bills/types";
import { Card, CardContent } from "../ui/card";

interface ComingSoonSectionProps {
  bills: ComingSoonBill[];
}

export function ComingSoonSection({ bills }: ComingSoonSectionProps) {
  // bills が空の場合は何も表示しない
  if (bills.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6">
      {/* ヘッダー */}
      <div className="flex flex-col gap-2">
        <h2 className="text-[22px] font-bold text-black leading-[1.48]">
          これから追加される法案
        </h2>
        <p className="text-xs text-[#404040]">
          みらい議会は、順次更新されていきます
        </p>
      </div>

      {/* Coming soonカードリスト */}
      <div className="flex flex-col gap-3">
        {bills.map((bill) => (
          <ComingSoonBillCard key={bill.id} bill={bill} />
        ))}
      </div>

      {/* 国会議案情報へのリンク */}
      <div className="text-center text-sm text-[#404040]">
        国会に提出されているすべての法案は{" "}
        <Link
          href="https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/menu.htm"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#007AFF] underline hover:opacity-80 inline-flex items-center gap-1"
        >
          国会議案情報へ
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}

function ComingSoonBillCard({ bill }: { bill: ComingSoonBill }) {
  const houseLabel = HOUSE_LABELS[bill.originating_house];

  // shugiin_url がある場合は外部リンク、ない場合はクリック不可
  if (bill.shugiin_url) {
    return (
      <Link
        href={bill.shugiin_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
          <CardContent className="flex items-center justify-between py-4 px-5">
            <div className="flex flex-col gap-1 min-w-0 pr-3">
              <h3 className="font-bold text-base text-black leading-tight">
                {bill.name}
              </h3>
              <p className="text-xs text-[#666666]">{houseLabel}提出</p>
            </div>
            <ExternalLink className="h-5 w-5 text-gray-400 flex-shrink-0" />
          </CardContent>
        </Card>
      </Link>
    );
  }

  // リンクがない場合
  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4 px-5">
        <div className="flex flex-col gap-1 min-w-0 pr-3">
          <h3 className="font-bold text-base text-black leading-tight">
            {bill.name}
          </h3>
          <p className="text-xs text-[#666666]">{houseLabel}提出</p>
        </div>
      </CardContent>
    </Card>
  );
}
