import { Badge } from "@/components/ui/badge";
import type { StanceTypeEnum } from "../types";
import { STANCE_LABELS } from "../types";

interface StanceBadgeProps {
  stance: StanceTypeEnum;
  className?: string;
}

const STANCE_STYLES: Record<StanceTypeEnum, string> = {
  for: "bg-emerald-100 text-emerald-800 border-emerald-200",
  against: "bg-rose-100 text-rose-800 border-rose-200",
  neutral: "bg-slate-100 text-slate-800 border-slate-200",
  conditional_for: "bg-teal-100 text-teal-800 border-teal-200",
  conditional_against: "bg-amber-100 text-amber-800 border-amber-200",
  considering: "bg-sky-100 text-sky-800 border-sky-200",
  continued_deliberation: "bg-violet-100 text-violet-800 border-violet-200",
};

export function StanceBadge({ stance, className }: StanceBadgeProps) {
  const styles = STANCE_STYLES[stance] || STANCE_STYLES.neutral;

  return (
    <Badge variant="outline" className={`${styles} ${className || ""}`}>
      {STANCE_LABELS[stance]}
    </Badge>
  );
}
