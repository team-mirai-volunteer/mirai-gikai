"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { rubyfulClient } from "./index";

interface RubyToggleProps {
  className?: string;
}

export function RubyToggle({ className }: RubyToggleProps) {
  const [rubyEnabled, setRubyEnabled] = useState(false);

  useEffect(() => {
    // LocalStorageから初期状態を取得
    setRubyEnabled(rubyfulClient.getIsEnabledFromStorage());
  }, []);

  const handleRubyToggle = (checked: boolean) => {
    setRubyEnabled(checked);

    if (checked) {
      rubyfulClient.show();
    } else {
      rubyfulClient.hide();
    }
    // 画面をリロード
    window.location.reload();
  };

  return (
    <div className={`flex items-center justify-between space-x-4 ${className}`}>
      <div className="space-y-0.5">
        <div className="text-sm font-medium">ふりがな表示</div>
      </div>
      <Switch
        checked={rubyEnabled}
        onCheckedChange={handleRubyToggle}
        aria-label="ふりがな表示の切り替え"
      />
    </div>
  );
}
