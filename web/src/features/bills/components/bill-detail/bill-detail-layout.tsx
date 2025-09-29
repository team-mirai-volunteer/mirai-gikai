import type { DifficultyLevelEnum } from "@/features/bill-difficulty/types";
import type { BillWithContent } from "../../types";
import { BillShareButtons } from "../share/bill-share-buttons";
import { BillContent } from "./bill-content";
import { BillDetailClient } from "./bill-detail-client";
import { BillDetailHeader } from "./bill-detail-header";
import { BillStatusProgress } from "./bill-status-progress";
import { MiraiStanceCard } from "./mirai-stance-card";

interface BillDetailLayoutProps {
  bill: BillWithContent;
  currentDifficulty: DifficultyLevelEnum;
}

export function BillDetailLayout({
  bill,
  currentDifficulty,
}: BillDetailLayoutProps) {
  const showMiraiStance = bill.status === "preparing" || bill.mirai_stance;
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BillDetailHeader bill={bill} />
      {/* 議案ステータス進捗 */}
      <div className="my-8">
        <BillStatusProgress
          status={bill.status}
          originatingHouse={bill.originating_house}
          statusNote={bill.status_note}
        />
      </div>

      {/*
        テキスト選択機能とチャット連携の実装パターン:
        - BillContentはServer Componentのまま保持（SSRによる高速な初期レンダリング）
        - BillDetailClientでクライアントサイド機能（テキスト選択、チャット連携）を提供
        - このパターンによりSSRを保持しつつインタラクティブ機能を実装
      */}
      <BillDetailClient bill={bill} currentDifficulty={currentDifficulty}>
        <BillContent bill={bill} />
      </BillDetailClient>

      {showMiraiStance && (
        <div className="my-8">
          <MiraiStanceCard
            stance={bill.mirai_stance}
            billStatus={bill.status}
          />
        </div>
      )}
      {/* シェアボタン */}
      <div className="my-8">
        <BillShareButtons bill={bill} />
      </div>
    </div>
  );
}
