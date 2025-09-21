import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MiraiStance } from "../../types";
import { StanceBadge } from "../bill-list/stance-badge";

interface MiraiStanceCardProps {
  stance: MiraiStance;
}

export function MiraiStanceCard({ stance }: MiraiStanceCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">チームみらいの見解</CardTitle>
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
