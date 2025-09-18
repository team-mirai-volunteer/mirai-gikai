import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
} from "lucide-react";

import type { BillStatus } from "../types";

// ステータスの表示設定（一覧画面で使用）
export const BILL_STATUS_CONFIG: Record<
  BillStatus,
  { icon: React.ElementType; color: string }
> = {
  introduced: {
    icon: FileText,
    color: "text-blue-600 bg-blue-50",
  },
  in_originating_house: {
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50",
  },
  in_receiving_house: {
    icon: AlertCircle,
    color: "text-orange-600 bg-orange-50",
  },
  enacted: {
    icon: CheckCircle,
    color: "text-green-600 bg-green-50",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-600 bg-red-50",
  },
};
