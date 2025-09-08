import { redirect } from "next/navigation";

import { checkAdminPermission } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/features/auth/lib/auth-server";

export default async function HomePage() {
  const user = await getCurrentUser();

  // 既にログイン済みの場合はダッシュボードへ
  if (user && checkAdminPermission(user)) {
    redirect("/dashboard");
  }

  // 未ログインの場合はログイン画面へ
  redirect("/login");
}
