"use client";

import { useId, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { setDifficultyLevel } from "../actions/set-difficulty-level";
import { DIFFICULTY_LABELS, type DifficultyLevelEnum } from "../types";

interface DifficultySelectorProps {
  currentLevel: DifficultyLevelEnum;
}

export function DifficultySelector({ currentLevel }: DifficultySelectorProps) {
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
      // Server Actionが成功したらページがrevalidateされて自動的にリロードされる
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
      <label
        htmlFor={`${uniqueId}-difficulty-toggle`}
        className="text-sm font-medium"
      >
        読みやすさ：
      </label>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {selectedLevel === "normal" ? "ふつう" : "詳しめ"}
        </span>
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
