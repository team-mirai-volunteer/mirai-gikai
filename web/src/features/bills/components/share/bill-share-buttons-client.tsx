"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { BillShareModal } from "./bill-share-modal";

interface BillShareButtonsClientProps {
  shareMessage: string;
  shareUrl: string;
}

export function BillShareButtonsClient({
  shareMessage,
  shareUrl,
}: BillShareButtonsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShare = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleReport = () => {
    // TODO: 問題報告機能の実装
    // 現時点ではプレースホルダーとして実装
    const subject = encodeURIComponent("みらい議会：問題の報告");
    const body = encodeURIComponent(
      `以下のページで問題を見つけました：\n${shareUrl}\n\n問題の詳細：\n`
    );
    window.location.href = `mailto:contact@example.com?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <Button
          variant="default"
          onClick={handleShare}
          className="rounded-full px-6 py-3 h-auto font-bold text-base bg-gradient-to-br from-[#BCEDD3] to-[#64D8C6] text-gray-800 hover:opacity-90 border border-gray-800"
        >
          <Image
            src="/icons/ios-share.svg"
            alt="共有アイコン"
            width={28}
            height={28}
            className="shrink-0"
          />
          記事を共有する
        </Button>
        <Button
          variant="outline"
          onClick={handleReport}
          className="rounded-full px-6 py-3 h-auto font-bold text-base bg-white text-gray-800 hover:bg-gray-50 border-gray-800"
        >
          <Image
            src="/icons/report-error.svg"
            alt="報告アイコン"
            width={26}
            height={26}
            className="shrink-0"
          />
          問題を報告する
        </Button>
      </div>

      {/* 共有モーダル */}
      <BillShareModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        shareMessage={shareMessage}
        shareUrl={shareUrl}
      />
    </>
  );
}
