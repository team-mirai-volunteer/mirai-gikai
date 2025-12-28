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
    <Button variant="outline" onClick={handleSaveAndExit}>
      保存して中断
    </Button>
  );
}
