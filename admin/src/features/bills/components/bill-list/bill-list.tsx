import Link from "next/link";
import { Calendar, Edit, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBills } from "../../api/get-bills";
import type { Bill, BillStatus } from "../../types";
import {
  BILL_STATUS_CONFIG,
  ORIGINATING_HOUSE_CONFIG,
} from "../../constants/bill-config";

function StatusBadge({ status }: { status: BillStatus }) {
  const config = BILL_STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
    >
      <Icon className="h-4 w-4" />
      <span>{config.label}</span>
    </div>
  );
}

function BillCard({ bill }: { bill: Bill }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 leading-6">
            {bill.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <StatusBadge status={bill.status} />
            <Link href={`/bills/${bill.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                編集
              </Button>
            </Link>
            <Link href={`/bills/${bill.id}/contents/edit`}>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                コンテンツ
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">提出院:</span>
            <div className="font-medium text-gray-900">
              {ORIGINATING_HOUSE_CONFIG[bill.originating_house]}
            </div>
          </div>
          <div>
            <span className="text-gray-500">状況:</span>
            <div className="font-medium text-gray-900">
              {bill.status_note || "-"}
            </div>
          </div>
          <div>
            <span className="text-gray-500 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              公開日:
            </span>
            <div className="font-medium text-gray-900">
              {new Date(bill.published_at).toLocaleDateString("ja-JP")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export async function BillList() {
  const bills = await getBills();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">{bills.length}件の議案</div>
      </div>

      <div className="space-y-4">
        {bills.map((bill) => (
          <BillCard key={bill.id} bill={bill} />
        ))}
      </div>
    </div>
  );
}
