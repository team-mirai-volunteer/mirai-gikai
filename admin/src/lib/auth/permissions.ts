import type { User } from "@supabase/supabase-js";

/**
 * ユーザーがadmin権限を持っているかチェック
 */
export function checkAdminPermission(user: User | null): boolean {
  if (!user) return false;
  const roles = user.app_metadata?.roles || [];
  return roles.includes("admin");
}

/**
 * ユーザーがeditor権限を持っているかチェック (将来的に使用)
 */
export function checkEditorPermission(user: User | null): boolean {
  if (!user) return false;
  const roles = user.app_metadata?.roles || [];
  return roles.includes("admin") || roles.includes("editor");
}