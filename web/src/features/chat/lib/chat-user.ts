import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  // NOTE: Calling getSession() here ensures Supabase refreshes the access/refresh
  // tokens if they are close to expiring.

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

  return {
    ok: true,
    userId: user.id,
    ...supabaseClient,
  };
}
