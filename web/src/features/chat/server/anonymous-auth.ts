"use server";

import { cookies, headers } from "next/headers";
import { type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@mirai-gikai/supabase";
import { createServerClient } from "@supabase/ssr";

export async function createSupabaseServerClient(): Promise<
  SupabaseClient<Database>
> {
  const cookieStore = await cookies();
  const headersList = headers();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
      headers: {
        get(key) {
          return headersList.get(key) ?? undefined;
        },
      },
    }
  );
}

export async function ensureAnonymousUser() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError &&
    userError.message &&
    userError.status !== 401 &&
    userError.status !== 400
  ) {
    throw new Error(`Failed to fetch Supabase user: ${userError.message}`);
  }

  if (user) {
    return { userId: user.id, isNew: false } as const;
  }

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    throw new Error(`Supabase anonymous sign-in failed: ${error.message}`);
  }

  return { userId: data.user.id, isNew: true } as const;
}

export async function markResponseStreaming() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.getUser();
}

