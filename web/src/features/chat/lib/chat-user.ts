import type { Database } from "@mirai-gikai/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseDatabaseClient = SupabaseClient<Database>;

type EnsureChatUserOptions = {
  supabase: SupabaseDatabaseClient;
  userId: string;
};

export type ChatUser = {
  id: string;
};

const CHAT_USER_SELECT_COLUMNS = "id";

export async function ensureChatUser({
  supabase,
  userId,
}: EnsureChatUserOptions): Promise<ChatUser> {
  const { data, error } = await supabase
    .from("chat_users")
    .select(CHAT_USER_SELECT_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch chat user: ${error.message}`);
  }

  if (data) {
    return data;
  }

  const { error: insertError } = await supabase
    .from("chat_users")
    .insert({ id: userId });

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: existingUser, error: duplicateFetchError } = await supabase
        .from("chat_users")
        .select(CHAT_USER_SELECT_COLUMNS)
        .eq("id", userId)
        .maybeSingle();

      if (duplicateFetchError) {
        throw new Error(
          `Failed to resolve duplicate chat user insert: ${duplicateFetchError.message}`
        );
      }

      if (existingUser) {
        return existingUser;
      }
    }

    throw new Error(`Failed to ensure chat user: ${insertError.message}`);
  }

  return { id: userId };
}

export type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

export type InitializeChatUserResult =
  | ({ ok: true; userId: string } & SupabaseServerClient)
  | { ok: false; response: Response };

export async function initializeChatUserSession(): Promise<InitializeChatUserResult> {
  const supabaseClient = await createSupabaseServerClient();
  const { supabase } = supabaseClient;

  let {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const { data: authData, error } = await supabase.auth.signInAnonymously();

    if (error || !authData.session) {
      console.error("Failed to initialize anonymous Supabase session", error);
      return {
        ok: false,
        response: new Response("Failed to initialize chat session", {
          status: 500,
        }),
      };
    }

    session = authData.session;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Failed to retrieve authenticated user", userError);
    return {
      ok: false,
      response: new Response("Failed to fetch chat user", { status: 500 }),
    };
  }

  try {
    await ensureChatUser({
      supabase,
      userId: user.id,
    });
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      response: new Response(
        error instanceof Error ? error.message : "Failed to ensure chat user",
        { status: 500 }
      ),
    };
  }

  return {
    ok: true,
    userId: user.id,
    ...supabaseClient,
  };
}
