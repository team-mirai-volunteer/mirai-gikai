"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { DIFFICULTY_COOKIE_NAME, type DifficultyLevelEnum } from "../types";

/**
 * 難易度設定をCookieに保存
 * Client Componentsから呼び出されるServer Action
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
