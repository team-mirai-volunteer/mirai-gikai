"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function BillDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Bill detail error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">エラーが発生しました</h2>
        <p className="text-gray-600 mb-6">
          議案の詳細情報を取得できませんでした。
        </p>
        <Button onClick={reset}>再試行</Button>
      </div>
    </div>
  );
}
