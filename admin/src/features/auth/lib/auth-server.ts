import { checkAdminPermission } from "@/lib/auth/permissions";
import { createAuthClient } from "@/lib/supabase/auth";

export async function getCurrentSession() {
  const authClient = await createAuthClient();
  const {
    data: { session },
    error,
  } = await authClient.getSession();

  if (error) {
    throw new Error("セッション情報の取得に失敗しました。");
  }

  return session;
}

/**
 * 現在のユーザーが管理者権限を持っているかチェックする
 * @returns 管理者の場合はuser、そうでない場合はnull
 */
export async function getCurrentAdmin() {
  const session = await getCurrentSession();
  const user = session?.user || null;

  if (!user || !checkAdminPermission(user)) {
    return null;
  }

  return user;
}

/**
 * 現在のユーザーが管理者としてログインしているかチェックする
 * 管理者でない場合はエラーを投げる
 */
export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    throw new Error("管理者権限が必要です");
  }

  return admin;
}
