import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@mirai-gikai/supabase";

export type { User } from "@supabase/supabase-js";

/**
 * サーバーコンポーネント用のSupabaseクライアントを作成
 * Server Components、Route Handlers、Server Actionsで使用
 */
// TODO: authだけで使ってる気がするので、authだけexportする
export async function createAuthClient() {
  const cookieStore = await cookies();

  const serverClient = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Componentでは無視
          }
        },
      },
    }
  );

  return serverClient.auth;
}
