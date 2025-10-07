import { type NextRequest, NextResponse } from "next/server";
import {
  createUnauthorizedResponse,
  getBasicAuthConfig,
  isPageSpeedInsights,
  validateBasicAuth,
} from "./lib/basic-auth";
import { updateSupabaseSession } from "@/features/chat/server/supabase-middleware";

export async function middleware(request: NextRequest) {
  const supabaseResponse = await updateSupabaseSession(request);

  const authConfig = getBasicAuthConfig();

  // Basic認証の設定がない場合はスキップ
  if (!authConfig) {
    return supabaseResponse;
  }

  // HTML ナビゲーションだけ認証（画像やJSON, css/js, fetch等は通す）
  if (!_isHtmlRequest(request)) return supabaseResponse;

  // PageSpeed Insightsからのアクセスは認証をスキップ
  if (isPageSpeedInsights(request)) {
    return supabaseResponse;
  }

  // Basic認証の検証
  if (validateBasicAuth(request, authConfig)) {
    return supabaseResponse;
  }

  return createUnauthorizedResponse();
}

function _isHtmlRequest(request: NextRequest) {
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
}
