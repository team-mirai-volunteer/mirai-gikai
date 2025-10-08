import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@mirai-gikai/supabase";

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

