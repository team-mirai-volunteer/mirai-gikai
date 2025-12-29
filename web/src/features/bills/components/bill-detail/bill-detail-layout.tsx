import { Container } from "@/components/layouts/container";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/types";
import { InterviewLandingSection } from "@/features/interview-config/client/components/interview-landing-section";
import { getInterviewConfig } from "@/features/interview-config/server/loaders/get-interview-config";
import type { BillWithContent } from "../../types";
import { BillShareButtons } from "../share/bill-share-buttons";
import { BillContent } from "./bill-content";
import { BillDetailClient } from "./bill-detail-client";
import { BillDetailHeader } from "./bill-detail-header";
import { BillDisclaimer } from "./bill-disclaimer";
import { BillStatusProgress } from "./bill-status-progress";
import { MiraiStanceCard } from "./mirai-stance-card";

interface BillDetailLayoutProps {
  bill: BillWithContent;
  currentDifficulty: DifficultyLevelEnum;
}

export async function BillDetailLayout({
  bill,
  currentDifficulty,
}: BillDetailLayoutProps) {
  const showMiraiStance = bill.status === "preparing" || bill.mirai_stance;
  const interviewConfig = await getInterviewConfig(bill.id);

  return (
    <div className="container mx-auto pb-8 max-w-4xl">
      {/*
        テキスト選択機能とチャット連携の実装パターン:
        - BillContentはServer Componentのまま保持（SSRによる高速な初期レンダリング）
        - BillDetailClientでクライアントサイド機能（テキスト選択、チャット連携）を提供
        - このパターンによりSSRを保持しつつインタラクティブ機能を実装
      */}
      <BillDetailClient bill={bill} currentDifficulty={currentDifficulty}>
        <BillDetailHeader bill={bill} />
        <Container>
          {/* 議案ステータス進捗 */}
          <div className="my-8">
            <BillStatusProgress
              status={bill.status}
              originatingHouse={bill.originating_house}
              statusNote={bill.status_note}
            />
          </div>

          <BillContent bill={bill} />
        </Container>
      </BillDetailClient>

      <Container>
        {/* リリース近づくまでは開発環境でのみ表示 */}
        {interviewConfig != null && process.env.NODE_ENV === "development" && (
          <div className="my-8">
            <InterviewLandingSection billId={bill.id} />
          </div>
        )}
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

        {/* データの出典と免責事項 */}
        <div className="my-8">
          <BillDisclaimer />
        </div>
      </Container>
    </div>
  );
}
