"use client";

import { Switch } from "@/components/ui/switch";
import { useRubyToggle } from "./use-ruby-toggle";

interface RubyToggleProps {
  className?: string;
}

export function RubyToggle({ className }: RubyToggleProps) {
  const { rubyEnabled, handleRubyToggle } = useRubyToggle();

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
