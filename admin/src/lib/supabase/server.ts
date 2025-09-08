import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@mirai-gikai/supabase";

/**
 * サーバーコンポーネント用のSupabaseクライアントを作成
 * Server Components、Route Handlers、Server Actionsで使用
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Componentでは無視
          }
        },
      },
    }
  );
}