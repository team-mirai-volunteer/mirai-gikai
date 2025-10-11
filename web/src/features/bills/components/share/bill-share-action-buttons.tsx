"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";

interface BillShareActionButtonsProps {
  shareMessage: string;
  shareUrl: string;
}

const SHARE_ICONS = [
  {
    name: "X (Twitter)",
    iconPath: "/icons/sns/icon_x.png",
    width: 48,
    height: 48,
  },
  {
    name: "LINE",
    iconPath: "/icons/sns/icon_line.png",
    width: 48,
    height: 48,
  },
  {
    name: "Facebook",
    iconPath: "/icons/sns/icon_facebook.png",
    width: 48,
    height: 48,
  },
  {
    name: "共有",
    iconPath: "/icons/ios-share.svg",
    width: 28,
    height: 28,
  },
] as const;

export function BillShareActionButtons({
  shareUrl,
}: BillShareActionButtonsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShare = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 背景クリック時のみモーダルを閉じる
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const handleBackgroundKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Escapeキーでモーダルを閉じる
    if (e.key === "Escape") {
      handleCloseModal();
    }
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
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3"
          onClick={handleBackgroundClick}
          onKeyDown={handleBackgroundKeyDown}
          tabIndex={-1}
        >
          <div className="bg-white rounded-2xl p-7 w-[370px] max-w-full flex flex-col items-center gap-9">
            {/* タイトル */}
            <h2 className="text-xl font-bold text-gray-800 text-center w-full">
              記事を共有する
            </h2>

            {/* プレースホルダー画像エリア */}
            <div className="w-full h-[181px] bg-gray-300 rounded" />

            {/* シェアセクション */}
            <div className="flex flex-col items-center gap-4 w-full">
              <p className="text-base font-bold text-gray-800 text-center">
                シェアして国会議論をオープンに
              </p>

              {/* SNSアイコン */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                {SHARE_ICONS.map((icon) => (
                  <button
                    key={icon.name}
                    type="button"
                    className="w-12 h-12 flex items-center justify-center"
                  >
                    <Image
                      src={icon.iconPath}
                      alt={icon.name}
                      width={icon.width}
                      height={icon.height}
                      className={icon.width === 48 ? "w-12 h-12" : "w-7 h-7"}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 閉じるボタン */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="w-[287px] max-w-full rounded-full px-6 py-3 font-bold text-base bg-gradient-to-br from-[#BCEDD3] to-[#64D8C6] text-gray-800 border border-gray-800"
            >
              このまま閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
