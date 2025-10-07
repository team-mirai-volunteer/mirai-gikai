import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "./server";

export async function updateSession(request: NextRequest) {
  const { supabase, applySessionCookies } = await createSupabaseServerClient();

  await supabase.auth.getSession();

  return applySessionCookies(
    NextResponse.next({
      request,
    })
  );
}
