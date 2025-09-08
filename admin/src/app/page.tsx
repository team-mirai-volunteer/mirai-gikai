import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 既にログイン済みの場合はダッシュボードへ
  if (session) {
    const roles = session.user.app_metadata?.roles || [];
    if (roles.includes("admin")) {
      redirect("/dashboard");
    }
  }

  // 未ログインの場合はログイン画面へ
  redirect("/login");
}
