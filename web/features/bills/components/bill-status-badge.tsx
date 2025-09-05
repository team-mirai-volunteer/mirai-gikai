import { Badge } from "@/components/ui/badge";
import type { BillStatusEnum } from "../types";
import { BILL_STATUS_LABELS } from "../types";

interface BillStatusBadgeProps {
  status: BillStatusEnum;
  className?: string;
}

export function BillStatusBadge({ status, className }: BillStatusBadgeProps) {
  const getStatusVariant = (status: BillStatusEnum) => {
    switch (status) {
      case "introduced":
        return "secondary";
      case "in_originating_house":
      case "in_receiving_house":
        return "default";
      case "enacted":
        return "success";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Badge variant={getStatusVariant(status)} className={className}>
      {BILL_STATUS_LABELS[status]}
    </Badge>
  );
}