import { createClient as createServerClient } from "@/lib/supabase/server";

export async function getCurrentSession() {
  const supabase = await createServerClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    throw new Error("セッション情報の取得に失敗しました。");
  }
  
  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user || null;
}