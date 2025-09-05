import Link from "next/link";
import type { BillWithStance } from "../types";
import { BillCard } from "./bill-card";

interface BillListProps {
  bills: BillWithStance[];
}

export function BillList({ bills }: BillListProps) {
  if (bills.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">議案が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {bills.map((bill) => (
        <Link key={bill.id} href={`/bills/${bill.id}`}>
          <BillCard bill={bill} />
        </Link>
      ))}
    </div>
  );
}