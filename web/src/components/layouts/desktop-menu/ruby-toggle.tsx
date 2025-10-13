"use client";

import { Switch } from "@/components/ui/switch";
import { useRubyToggle } from "@/lib/rubyful/use-ruby-toggle";

/**
 * デスクトップメニュー: ルビ切り替え (画面右上、難易度切り替えの下)
 */
export function DesktopMenuRubyToggle() {
  const { rubyEnabled, handleRubyToggle } = useRubyToggle();

  return (
    <div className="fixed top-[108px] right-6 z-50">
      <div
        className="bg-white flex items-center gap-6 font-bold text-black"
        style={{
          borderRadius: "50px",
          padding: "20px 24px 20px 36px",
          width: "332px",
        }}
      >
        <span
          className="flex-1"
          style={{
            fontSize: "20px",
          }}
        >
          ふりがなを表示する
        </span>
        <Switch
          checked={rubyEnabled}
          onCheckedChange={handleRubyToggle}
          aria-label="ルビ表示の切り替え"
        />
      </div>
    </div>
  );
}
