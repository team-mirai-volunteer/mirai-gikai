import type { BillWithContent, DifficultyLevelEnum } from "../../types";
import { DifficultySelector } from "../difficulty-selector";
import { BillContent } from "./bill-content";
import { BillDetailHeader } from "./bill-detail-header";
import { MiraiStanceCard } from "./mirai-stance-card";

interface BillDetailLayoutProps {
  bill: BillWithContent;
  currentDifficulty: DifficultyLevelEnum;
}

export function BillDetailLayout({ bill, currentDifficulty }: BillDetailLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BillDetailHeader bill={bill} />

      {/* 難易度切り替えセレクター */}
      <div className="mb-6 flex justify-end">
        <DifficultySelector currentLevel={currentDifficulty} />
      </div>

      <BillContent bill={bill} />

      {bill.mirai_stance && (
        <div className="my-8">
          <MiraiStanceCard stance={bill.mirai_stance} />
        </div>
      )}
    </div>
  );
}
