import { cookies } from "next/headers";
import {
  DEFAULT_DIFFICULTY,
  DIFFICULTY_COOKIE_NAME,
  type DifficultyLevelEnum,
} from "../types";

/**
 * 現在の難易度設定をCookieから取得
 * Server Componentsから呼び出される読み取り専用の関数
 */
export async function getDifficultyLevel(): Promise<DifficultyLevelEnum> {
  const cookieStore = await cookies();
  const difficulty = cookieStore.get(DIFFICULTY_COOKIE_NAME);

  if (!difficulty) {
    return DEFAULT_DIFFICULTY;
  }

  // 有効な値かチェック
  const validLevels: DifficultyLevelEnum[] = ["easy", "normal", "hard"];
  if (validLevels.includes(difficulty.value as DifficultyLevelEnum)) {
    return difficulty.value as DifficultyLevelEnum;
  }

  return DEFAULT_DIFFICULTY;
}
