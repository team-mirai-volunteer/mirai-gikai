"use client";

import { useId, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { setDifficultyLevel } from "../actions/set-difficulty-level";
import {
  saveScrollDistanceFromBottom,
  useRestoreScrollFromBottom,
} from "../hooks/use-scroll-from-bottom";
import type { DifficultyLevelEnum } from "../types";

interface DifficultySelectorProps {
  currentLevel: DifficultyLevelEnum;
  label?: string;
  labelStyle?: React.CSSProperties;
  scrollToTop?: boolean;
  maintainScrollFromBottom?: boolean;
}

export function DifficultySelector({
  currentLevel,
  label = "より詳しく",
  labelStyle,
  scrollToTop,
  maintainScrollFromBottom,
}: DifficultySelectorProps) {
  const [selectedLevel, setSelectedLevel] =
    useState<DifficultyLevelEnum>(currentLevel);
  const uniqueId = useId();
  const [isChanging, setIsChanging] = useState(false);

  // ページロード時にスクロール位置を復元
  useRestoreScrollFromBottom(maintainScrollFromBottom ?? false);

  const handleToggle = async (checked: boolean) => {
    const newLevel = checked ? "hard" : "normal";
    setIsChanging(true);
    setSelectedLevel(newLevel);

    try {
      await setDifficultyLevel(newLevel);

      if (scrollToTop) {
        // スクロール位置をトップに戻す
        window.scrollTo(0, 0);
      } else if (maintainScrollFromBottom) {
        // 画面下端からの距離を保存
        saveScrollDistanceFromBottom();
      }

      // URLから ?difficulty パラメータを削除
      const url = new URL(window.location.href);
      if (url.searchParams.get("difficulty") !== null) {
        url.searchParams.delete("difficulty");
        // パラメータを削除したURLでリロード
        // ただし、スクロール位置は維持されない
        window.location.replace(url.toString());
      } else {
        // パラメータがない場合は通常のリロード
        // この場合はスクロール位置は維持される
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update difficulty level:", error);
      // エラーの場合は元に戻す
      setSelectedLevel(currentLevel);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold" style={labelStyle}>
        {label}
      </span>
      <Switch
        id={`${uniqueId}-difficulty-toggle`}
        checked={selectedLevel === "hard"}
        onCheckedChange={handleToggle}
        disabled={isChanging}
        aria-label="難易度を切り替え"
      />
    </div>
  );
}
