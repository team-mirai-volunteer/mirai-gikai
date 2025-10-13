"use client";

import Image from "next/image";
import { useState } from "react";
import { BillShareModal } from "../share/bill-share-modal";

interface BillDetailShareButtonProps {
  shareMessage: string;
  shareUrl: string;
  thumbnailUrl?: string | null;
}

export function BillDetailShareButton({
  shareMessage,
  shareUrl,
  thumbnailUrl,
}: BillDetailShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="hover:opacity-80 transition-opacity"
      >
        <Image
          src="/icons/ios-share.svg"
          alt="共有アイコン"
          width={28}
          height={28}
          className="shrink-0"
        />
      </button>

      <BillShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shareMessage={shareMessage}
        shareUrl={shareUrl}
        thumbnailUrl={thumbnailUrl}
      />
    </>
  );
}
