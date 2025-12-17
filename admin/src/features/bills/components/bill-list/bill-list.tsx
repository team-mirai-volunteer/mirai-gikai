import { Calendar, Edit, FileText, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBills } from "../../api/get-bills";
import { BILL_STATUS_CONFIG } from "../../constants/bill-config";
import type { Bill, BillStatus } from "../../types";
import { getBillStatusLabel } from "../../types";
import { BillActionsMenu } from "../bill-actions-menu/bill-actions-menu";
import { PreviewButton } from "./preview-button";
import { PublishStatusBadge } from "./publish-status-badge";
import { ViewButton } from "./view-button";

function StatusBadge({
  status,
  originatingHouse,
}: {
  status: BillStatus;
  originatingHouse: Bill["originating_house"];
}) {
  const config = BILL_STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 py-1 rounded-full text-sm font-bold`}
    >
      <Icon className="h-4 w-4" />
      <span>{getBillStatusLabel(status, originatingHouse)}</span>
    </div>
  );
}

function BillCard({ bill }: { bill: Bill }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row justify-between items-center gap-3">
          <CardTitle className="text-lg font-semibold text-gray-900 leading-6">
            {bill.name}
          </CardTitle>
          <BillActionsMenu billId={bill.id} billName={bill.name} />
        </div>
        <div className="flex flex-none flex-wrap gap-2">
          <PublishStatusBadge
            billId={bill.id}
            publishStatus={bill.publish_status}
          />
          {(bill.publish_status === "draft" ||
            bill.publish_status === "coming_soon") && (
            <PreviewButton billId={bill.id} />
          )}
          {bill.publish_status === "published" && (
            <ViewButton billId={bill.id} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <div className="mb-2 flex items-center gap-2">
            <StatusBadge
              status={bill.status}
              originatingHouse={bill.originating_house}
            />
            <div className="font-medium text-gray-900">
              {bill.status_note || "-"}
            </div>
          </div>
          <div className="">
            <span className="text-gray-500 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              公開日:
              <span className="font-medium text-gray-900">
                {bill.published_at
                  ? new Date(bill.published_at).toLocaleDateString("ja-JP")
                  : "-"}
              </span>
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Link href={`/bills/${bill.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                基本情報
              </Button>
            </Link>
            <Link href={`/bills/${bill.id}/contents/edit`}>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                コンテンツ
              </Button>
            </Link>
            <Link href={`/bills/${bill.id}/interview/edit`}>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-1" />
                インタビュー設定
              </Button>
            </Link>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export async function BillList() {
  const bills = await getBills();

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-sm text-gray-600">{bills.length}件の議案</div>
        <Link href="/bills/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            新規作成
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {bills.map((bill) => (
          <BillCard key={bill.id} bill={bill} />
        ))}
      </div>
    </div>
  );
}
