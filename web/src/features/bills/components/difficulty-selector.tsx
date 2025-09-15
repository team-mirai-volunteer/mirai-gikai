"use client";

import { useState, useId } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DifficultyLevelEnum } from "../types";
import { setDifficultyLevel } from "../actions/difficulty";

interface DifficultySelectorProps {
  currentLevel: DifficultyLevelEnum;
}

const DIFFICULTY_LABELS: Record<DifficultyLevelEnum, string> = {
  easy: "やさしい",
  normal: "ふつう",
  hard: "難しい",
};

export function DifficultySelector({ currentLevel }: DifficultySelectorProps) {
  const [selectedLevel, setSelectedLevel] =
    useState<DifficultyLevelEnum>(currentLevel);
  const uniqueId = useId();
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = async (value: DifficultyLevelEnum) => {
    setIsChanging(true);
    setSelectedLevel(value);

    try {
      await setDifficultyLevel(value);
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
      <label htmlFor="difficulty-selector" className="text-sm font-medium">
        読みやすさ：
      </label>
      <Select
        value={selectedLevel}
        onValueChange={handleChange}
        disabled={isChanging}
      >
        <SelectTrigger
          id={`${uniqueId}-difficulty-selector`}
          className="w-[180px]"
          aria-label="難易度を選択"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(["easy", "normal", "hard"] as const).map((level) => (
            <SelectItem key={level} value={level}>
              <div className="flex flex-col">
                <span className="font-medium">{DIFFICULTY_LABELS[level]}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
