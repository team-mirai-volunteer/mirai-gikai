"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { DifficultyLevelEnum } from "../types";

const DIFFICULTY_COOKIE_NAME = "bill_difficulty_level";
const DEFAULT_DIFFICULTY: DifficultyLevelEnum = "normal";

/**
 * 現在の難易度設定を取得
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

/**
 * 難易度設定を保存
 */
export async function setDifficultyLevel(level: DifficultyLevelEnum) {
  const cookieStore = await cookies();

  cookieStore.set(DIFFICULTY_COOKIE_NAME, level, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1年間
    path: "/",
  });

  // ページを再検証して最新のコンテンツを表示
  revalidatePath("/");
  revalidatePath("/bills/[id]", "page");
}