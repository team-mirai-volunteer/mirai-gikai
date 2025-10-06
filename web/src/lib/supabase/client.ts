import { createBrowserClient } from "@mirai-gikai/supabase";

/**
 * ブラウザ環境用のSupabaseクライアントを作成
 * Client Componentsで使用
 */
export function createClient() {
  return createBrowserClient();
}
