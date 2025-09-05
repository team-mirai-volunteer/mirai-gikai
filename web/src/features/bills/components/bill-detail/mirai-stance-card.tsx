import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StanceBadge } from "../bill-list/stance-badge";
import type { MiraiStance } from "../../types";

interface MiraiStanceCardProps {
  stance: MiraiStance;
}

export function MiraiStanceCard({ stance }: MiraiStanceCardProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">政党チームみらいの見解</CardTitle>
          <StanceBadge stance={stance.type} />
        </div>
      </CardHeader>
      {stance.comment && (
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {stance.comment}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
