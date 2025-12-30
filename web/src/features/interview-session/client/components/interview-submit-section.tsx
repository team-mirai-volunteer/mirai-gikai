"use client";

import { useState } from "react";
import { InterviewPublicConsentModal } from "@/features/interview-report/client/components/interview-public-consent-modal";
import { updatePublicSetting } from "@/features/interview-report/server/actions/update-public-setting";

interface InterviewSubmitSectionProps {
  sessionId: string;
  reportId: string;
}

export function InterviewSubmitSection({
  sessionId,
  reportId,
}: InterviewSubmitSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (isPublic: boolean) => {
    setIsSubmitting(true);
    try {
      const result = await updatePublicSetting(sessionId, isPublic);
      if (result.success) {
        window.location.href = `/report/${reportId}`;
      } else {
        console.error("Failed to update public setting:", result.error);
        setIsSubmitting(false);
      }
      // 画面遷移するまで isSubmitting を true のままにする
    } catch (err) {
      console.error("Failed to update public setting:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-3 flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center justify-center rounded-md bg-[#0F8472] px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-60"
      >
        インタビューの提出に進む
      </button>

      <InterviewPublicConsentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
