import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/features/auth/lib/auth-server";

export default async function HomePage() {
  const admin = await getCurrentAdmin();

  // 管理者としてログイン済みの場合はダッシュボードへ
  if (admin) {
    redirect("/dashboard");
  }

  // 未ログインまたは管理者でない場合はログイン画面へ
  redirect("/login");
}
