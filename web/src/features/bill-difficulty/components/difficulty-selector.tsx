"use client";

import { useId, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { setDifficultyLevel } from "../actions/set-difficulty-level";
import type { DifficultyLevelEnum } from "../types";

interface DifficultySelectorProps {
  currentLevel: DifficultyLevelEnum;
  label?: string;
  scrollToTop?: boolean;
}

export function DifficultySelector({
  currentLevel,
  label = "より詳しく",
  scrollToTop,
}: DifficultySelectorProps) {
  const [selectedLevel, setSelectedLevel] =
    useState<DifficultyLevelEnum>(currentLevel);
  const uniqueId = useId();
  const [isChanging, setIsChanging] = useState(false);

  const handleToggle = async (checked: boolean) => {
    const newLevel = checked ? "hard" : "normal";
    setIsChanging(true);
    setSelectedLevel(newLevel);

    try {
      await setDifficultyLevel(newLevel);
      if (scrollToTop) {
        // スクロール位置をトップに戻す
        window.scrollTo(0, 0);
      }
      window.location.reload();
    } catch (error) {
      console.error("Failed to update difficulty level:", error);
      // エラーの場合は元に戻す
      setSelectedLevel(currentLevel);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 font-bold">{label}</span>
        <Switch
          id={`${uniqueId}-difficulty-toggle`}
          checked={selectedLevel === "hard"}
          onCheckedChange={handleToggle}
          disabled={isChanging}
          aria-label="難易度を切り替え"
        />
      </div>
    </div>
  );
}
