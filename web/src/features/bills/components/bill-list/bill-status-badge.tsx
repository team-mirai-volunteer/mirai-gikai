import { Badge } from "@/components/ui/badge";
import type { BillStatusEnum, HouseEnum } from "../../types";
import { getBillStatusLabel } from "../../types";

interface BillStatusBadgeProps {
  status: BillStatusEnum;
  originatingHouse?: HouseEnum | null;
  className?: string;
}

export function BillStatusBadge({
  status,
  originatingHouse,
  className,
}: BillStatusBadgeProps) {
  const getStatusVariant = (status: BillStatusEnum) => {
    switch (status) {
      case "introduced":
      case "in_originating_house":
      case "in_receiving_house":
        return "outline";
      case "enacted":
      case "rejected":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <Badge variant={getStatusVariant(status)} className={className}>
      {getBillStatusLabel(status, originatingHouse)}
    </Badge>
  );
}
