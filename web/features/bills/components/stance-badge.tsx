import { Badge } from "@/components/ui/badge";
import type { StanceTypeEnum } from "../types";
import { STANCE_LABELS } from "../types";

interface StanceBadgeProps {
  stance: StanceTypeEnum;
  className?: string;
}

export function StanceBadge({ stance, className }: StanceBadgeProps) {
  const getStanceVariant = (stance: StanceTypeEnum) => {
    switch (stance) {
      case "for":
        return "success";
      case "against":
        return "destructive";
      case "neutral":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <Badge variant={getStanceVariant(stance)} className={className}>
      {STANCE_LABELS[stance]}
    </Badge>
  );
}