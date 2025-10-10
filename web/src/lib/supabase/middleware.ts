import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "./server";

export async function updateSession(request: NextRequest) {
  const { supabase, applySessionCookies } = await createSupabaseServerClient();

  // Refresh the session proactively so the latest access/refresh tokens end up
  // in the Supabase-managed cookie jar, which applySessionCookies will forward
  // to the response below.
  await supabase.auth.getSession();

  return applySessionCookies(
    NextResponse.next({
      request,
    })
  );
}
