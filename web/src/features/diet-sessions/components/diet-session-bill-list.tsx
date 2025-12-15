import Link from "next/link";
import type { DietSession } from "../types";
import type { BillWithContent } from "@/features/bills/types";
import { BillCard } from "@/features/bills/components/bill-list/bill-card";
import { formatDateWithDots } from "@/lib/utils/date";

type Props = {
  session: DietSession;
  bills: BillWithContent[];
};

export function DietSessionBillList({ session, bills }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* ヘッダー */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{session.name}に提出された法案</h1>
        <p className="text-muted-foreground text-sm">
          {formatDateWithDots(session.start_date)} 〜{" "}
          {formatDateWithDots(session.end_date)}
        </p>
      </div>

      {/* 議案件数 */}
      <div className="text-sm text-muted-foreground">全 {bills.length} 件</div>

      {/* 法案リスト */}
      {bills.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">
          この会期の法案はまだありません
        </p>
      ) : (
        <div className="grid gap-4">
          {bills.map((bill) => (
            <Link key={bill.id} href={`/bills/${bill.id}`}>
              <BillCard bill={bill} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
