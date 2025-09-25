import { DifficultySelector } from "@/features/bill-difficulty/components/difficulty-selector";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/types";
import { TextSelectionWrapper } from "@/features/bills/components/text-selection-tooltip/text-selection-wrapper";
import type { BillWithContent } from "../../types";
import { BillContent } from "./bill-content";
import { BillDetailHeader } from "./bill-detail-header";
import { MiraiStanceCard } from "./mirai-stance-card";

interface BillDetailLayoutProps {
  bill: BillWithContent;
  currentDifficulty: DifficultyLevelEnum;
}

export function BillDetailLayout({
  bill,
  currentDifficulty,
}: BillDetailLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BillDetailHeader bill={bill} />

      {/* 難易度切り替えセレクター */}
      <div className="mb-6 flex justify-end">
        <DifficultySelector currentLevel={currentDifficulty} />
      </div>

      {/*
        テキスト選択機能の実装パターン:
        - BillContentはServer Componentのまま保持（SSRによる高速な初期レンダリング）
        - TextSelectionWrapperはClient Componentとして、テキスト選択の監視機能のみを追加
        - このパターンによりServer/Client Componentの境界を適切に管理
      */}
      <TextSelectionWrapper>
        <BillContent bill={bill} />
      </TextSelectionWrapper>

      {bill.mirai_stance && (
        <div className="my-8">
          <MiraiStanceCard stance={bill.mirai_stance} />
        </div>
      )}
    </div>
  );
}
