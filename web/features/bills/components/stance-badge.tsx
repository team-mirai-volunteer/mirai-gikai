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
      case "against":
      case "neutral":
        return "default";
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
