"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { extractBillIdFromPath } from "@/lib/page-layout-utils";

export function InterviewHeaderActions() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSaveAndExit = () => {
    const billId = extractBillIdFromPath(pathname);
    if (billId) {
      router.push(`/bills/${billId}/interview`);
    } else {
      router.push("/");
    }
  };

  return (
    <Button
      // type="button"
      variant="outline"
      onClick={handleSaveAndExit}
      // className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
    >
      保存して中断
    </Button>
  );
}
