import "server-only";

import type { Database } from "@mirai-gikai/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { env } from "../env";

type PendingCookie = {
  name: string;
  value: string;
  options?: Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[2];
};

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const pendingCookies: PendingCookie[] = [];

  const supabase = createServerClient<Database>(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            pendingCookies.push({ name, value, options });
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Route Handlersでは非対応（mutating headers）なので無視
            }
          }
        },
      },
    }
  );

  const applySessionCookies = (response: NextResponse) => {
    for (const { name, value, options } of pendingCookies) {
      response.cookies.set(name, value, options);
    }
    return response;
  };

  return { supabase, applySessionCookies };
}
