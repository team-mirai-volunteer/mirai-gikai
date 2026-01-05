"use client";

import { useAnonymousSupabaseUser } from "@/features/chat/client/hooks/use-anonymous-supabase-user";

export function AuthGate({ children }: { children?: React.ReactNode }) {
  useAnonymousSupabaseUser();

  return <>{children}</>;
}
