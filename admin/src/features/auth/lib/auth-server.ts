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

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user || null;
}
